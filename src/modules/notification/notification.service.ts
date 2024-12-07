import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    Notification,
    notificationTypes,
    NotificationTypeType,
} from "./entities/notification.entity";
import { LessThan, Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { FriendGameInviteDto } from "./dto/friendGameInvite.dto";
import { WsException } from "@nestjs/websockets";
import { ManageFriendGameInviteDto } from "./dto/manageFriendGameInvite.dto";
import { UserService } from "../user/user.service";
import { FriendRequestDto } from "./dto/friendRequest.dto";
import { GameService } from "../chess/submodules/handle-game/game.service";
import {
    PlayerCandidateVerifiedData,
    PlayersService,
} from "../chess/submodules/players.service";
import { Cron, CronExpression } from "@nestjs/schedule";

type socketId = string;
type userId = string;

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        private readonly userService: UserService,
        private gameService: GameService,
        private readonly playersService: PlayersService,
    ) {}

    /**
     * Maps user IDs to their corresponding socket IDs. to track active users
     * userId -> socketId
     */
    public userIdToSocketIdMap = new Map<userId, socketId>();

    /**
     * Maps socket IDs to their corresponding user IDs. to track active users. Reverse map of userIdToSocketIdMap
     * socketId -> userId
     */
    public socketIdToUserIdMap = new Map<socketId, userId>();

    /** start tracking active users. its userId and socketId */
    addActiveUser(userId: number, socketId: string) {
        this.userIdToSocketIdMap.set(userId.toString(), socketId);
        this.socketIdToUserIdMap.set(socketId, userId.toString());
    }

    /** stop tracking active users when they disconnect */
    removeActiveUser(socketId: string) {
        const userId = this.socketIdToUserIdMap.get(socketId);
        this.socketIdToUserIdMap.delete(socketId);
        this.userIdToSocketIdMap.delete(userId);
    }

    private getSocketIdByUserId(userId: number | string): string | null {
        return this.userIdToSocketIdMap.get(userId.toString()) || null;
    }

    /**
     * Returns all notifications for a given user.
     */
    async getAllNotifications(userId: number) {
        const notifications = this.notificationRepository.find({
            where: { userWhoReceive: { userId } },
            order: { timeStamp: "DESC" },
        });

        this.markAllNotificationsAsRead(userId);
        return notifications;
    }

    private async markAllNotificationsAsRead(userId: number) {
        await this.notificationRepository.update(
            { userWhoReceive: { userId } },
            { isRead: true },
        );
    }

    /**
     * Deletes notifications that are older than one week and have been marked as read.
     * This method is scheduled to run every week.
     */
    @Cron(CronExpression.EVERY_WEEK)
    async deleteOldReadNotifications() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        await this.notificationRepository.delete({
            isRead: true,
            timeStamp: LessThan(oneWeekAgo),
        });
    }

    /**
     * Creates a new notification and saves it to the repository.
     */
    async createNotification(
        receiver: User,
        sender: User | null,
        type: NotificationTypeType,
        title: string,
        message: string,
        options?: {
            actionText1?: string;
            actionLink1?: string;
            actionText2?: string;
            actionLink2?: string;
        },
    ) {
        const { actionText1, actionLink1, actionText2, actionLink2 } = options;

        // If sender is null, it means is a notification send by the system
        const verifySender = sender
            ? {
                  userId: sender.userId,
                  nickname: sender.nickname,
                  userAvatarImg: sender.userAvatarImg,
              }
            : null;

        const newNotification = this.notificationRepository.create({
            userWhoSend: verifySender,
            userWhoReceive: {
                userId: receiver.userId,
                nickname: receiver.nickname,
                userAvatarImg: receiver.userAvatarImg,
            },
            type,
            title,
            message,
            actionText1,
            actionLink1,
            actionText2,
            actionLink2,
            timeStamp: new Date(),
        });
        await this.notificationRepository.save(newNotification);
        return newNotification;
    }

    public gameInvites = new Map<
        number,
        { sender: User; game: FriendGameInviteDto }
    >(); // notificationId -> game data

    async sendFriendGameInvite(sender: User, data: FriendGameInviteDto) {
        // 0. Make some verifications
        const receiver = await this.userRepository.findOneBy({
            userId: data.receiverId,
        });
        if (!receiver) throw new WsException("User not found");

        const areFriends = await this.userService.areUsersFriends(
            sender.userId,
            receiver.userId,
        );
        if (!areFriends)
            throw new WsException("You are not friends with this user");

        // 1. Create new notification (save in DB)
        const newNotification = await this.createNotification(
            receiver,
            sender,
            notificationTypes.WANTS_TO_PLAY,
            "New Game Invite",
            "has invited you to play a game!",
            {
                actionText1: "Accept",
                actionLink1: "notif:acceptFriendGameInvite",
                actionText2: "Reject",
                actionLink2: "notif:rejectFriendGameInvite",
            },
        );

        // 2. Save game data in memory
        this.gameInvites.set(newNotification.notificationId, {
            sender,
            game: data,
        });

        const socketId = this.getSocketIdByUserId(receiver.userId);
        return { socketId, newNotification };
    }

    async manageFriendGameInvite(receiver: User, notifId: number) {
        const notification = await this.notificationRepository.findOneBy({
            notificationId: notifId,
            type: notificationTypes.WANTS_TO_PLAY,
        });

        if (!notification) throw new WsException("Notification not found");
        if (notification.userWhoReceive.userId !== receiver.userId)
            throw new WsException("You are not allowed to perform this action");

        const gameInvite = this.gameInvites.get(notifId);
        await this.notificationRepository.delete({ notificationId: notifId });
        this.gameInvites.delete(notifId);

        const userWhoSendsSocketId = this.getSocketIdByUserId(
            notification.userWhoSend.userId,
        );
        const userWhoReceivesSocketId = this.userIdToSocketIdMap.get(
            receiver.userId.toString(),
        );
        return { userWhoSendsSocketId, userWhoReceivesSocketId, gameInvite };
    }

    async acceptFriendGameInvite(
        receiver: User,
        { notificationId }: ManageFriendGameInviteDto,
    ) {
        const { userWhoSendsSocketId, userWhoReceivesSocketId, gameInvite } =
            await this.manageFriendGameInvite(receiver, notificationId);
        if (!userWhoSendsSocketId) return { userWhoSendsSocketId, undefined }; // User is not online

        const { sender, game } = gameInvite;

        const player1Elo = this.playersService.setEloByModeForNonGuestPlayer(
            sender,
            game.mode,
        );
        const player2Elo = this.playersService.setEloByModeForNonGuestPlayer(
            receiver,
            game.mode,
        );

        const player1 = this.playersService.transforPlayerData({
            elo: player1Elo,
            isGuest: false,
            userInfo: sender,
        }) as PlayerCandidateVerifiedData;

        const player2 = this.playersService.transforPlayerData({
            elo: player2Elo,
            isGuest: false,
            userInfo: receiver,
        }) as PlayerCandidateVerifiedData;

        const gameInstance = await this.gameService.createGame(
            player1,
            player2,
            game.mode,
            "Friend Req",
            game.timeInMinutes,
            game.timeIncrementPerMoveSeconds,
        );

        const gameData = gameInstance.getProperties();

        return { userWhoSendsSocketId, userWhoReceivesSocketId, gameData };
    }

    async rejectFriendGameInvite(
        receiver: User,
        { notificationId }: ManageFriendGameInviteDto,
    ) {
        const { userWhoSendsSocketId } = await this.manageFriendGameInvite(
            receiver,
            notificationId,
        );

        return userWhoSendsSocketId;
    }

    async sendFriendRequest(sender: User, { receiverId }: FriendRequestDto) {
        // 0. Make some verifications
        const receiver = await this.userRepository.findOneBy({
            userId: receiverId,
        });
        if (!receiver) throw new WsException("User not found");

        const areFriends = await this.userService.areUsersFriends(
            sender.userId,
            receiverId,
        );
        if (areFriends)
            throw new WsException("You are already friends with this user");

        const existingNotification =
            await this.notificationRepository.findOneBy({
                userWhoSend: { userId: sender.userId },
                userWhoReceive: { userId: receiverId },
                type: notificationTypes.REQUEST_TO_BE_FRIEND,
            });
        if (existingNotification)
            throw new WsException("Friend request was already sent");

        // 1. Create new notification (save in DB)
        const newNotification = await this.createNotification(
            receiver,
            sender,
            notificationTypes.REQUEST_TO_BE_FRIEND,
            "New Friend Request",
            "has sent you a friend request!",
            {
                actionText1: "Accept",
                actionLink1: "notif:acceptFriendRequest",
                actionText2: "Reject",
                actionLink2: "notif:rejectFriendRequest",
            },
        );

        // receiver socketId
        const socketId = this.getSocketIdByUserId(receiverId);

        return { socketId, newNotification };
    }

    async acceptFriendRequest(receiver: User, { notificationId }: any) {
        const { socketId, notification } = await this.processFriendRequest(
            receiver,
            notificationId,
        );

        await this.userService.addFriend(
            receiver.userId,
            notification.userWhoSend.userId,
        );

        const newNotification = await this.createNotification(
            receiver,
            null,
            notificationTypes.ACCEPTED_FRIEND_REQUEST,
            "Friend Request Accepted",
            "has accepted your friend request!",
        );

        return { socketId, newNotification };
    }

    async rejectFriendRequest(receiver: User, { notificationId }: any) {
        try {
            await this.processFriendRequest(receiver, notificationId);
        } catch (error) {
            throw new WsException("Failed to reject friend request");
        }
    }

    /**
     * Processes a friend request by validating the notification, deleting related notifications, and obtaining the sender's socket ID.
     */
    async processFriendRequest(receiver: User, notificationId: number) {
        // Validar la notificación
        const notification = await this.validateFriendRequest(
            receiver,
            notificationId,
        );

        // delete notification
        await this.notificationRepository.delete({
            type: notificationTypes.REQUEST_TO_BE_FRIEND,
            userWhoSend: { userId: receiver.userId },
        });
        await this.notificationRepository.delete({ notificationId });

        // return socketId of sender
        const socketId = this.getSocketIdByUserId(
            notification.userWhoSend.userId,
        );

        return { socketId, notification };
    }

    private async validateFriendRequest(
        receiver: User,
        friendRequestId: number,
    ) {
        const notification = await this.notificationRepository.findOneBy({
            notificationId: friendRequestId,
            type: notificationTypes.REQUEST_TO_BE_FRIEND,
        });

        if (!notification) throw new WsException("Friend request not found");
        if (notification.userWhoReceive.userId !== receiver.userId) {
            throw new WsException(
                "You are not authorized to manage this friend request",
            );
        }

        return notification;
    }
}

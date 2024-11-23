import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    Notification,
    notificationTypes,
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

    public activeUsers = new Map<number, string>(); // userId -> socket.id
    public activeUsersReverse = new Map<string, number>(); // socket.id -> userId
    public gameInvites = new Map<
        number,
        { sender: User; game: FriendGameInviteDto }
    >(); // notificationId -> game data

    addActiveUser(userId: number, socketId: string) {
        this.activeUsers.set(userId, socketId);
        this.activeUsersReverse.set(socketId, userId);
    }

    removeActiveUser(socketId: string) {
        const userId = this.activeUsersReverse.get(socketId);
        this.activeUsersReverse.delete(socketId);
        this.activeUsers.delete(userId);
    }

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
        const newNotification = this.notificationRepository.create({
            userWhoSend: {
                userId: sender.userId,
                nickname: sender.nickname,
                userAvatarImg: sender.userAvatarImg,
            },
            userWhoReceive: {
                userId: receiver.userId,
                nickname: receiver.nickname,
                userAvatarImg: receiver.userAvatarImg,
            },
            type: notificationTypes.WANTS_TO_PLAY,
            title: "New Game Invite",
            message: "has invited you to play a game!",
            timeStamp: new Date(),
        });
        await this.notificationRepository.save(newNotification);

        // 2. Save game data in memory
        this.gameInvites.set(newNotification.notificationId, {
            sender,
            game: data,
        });

        const socketId = this.activeUsers.get(receiver.userId);
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

        const socketId = this.activeUsers.get(notification.userWhoSend.userId);
        return { socketId, gameInvite };
    }

    async acceptFriendGameInvite(
        receiver: User,
        { notificationId }: ManageFriendGameInviteDto,
    ) {
        const { socketId, gameInvite } = await this.manageFriendGameInvite(
            receiver,
            notificationId,
        );
        if (!socketId) return { socketId, undefined }; // User is not online

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

        const gameInstance = this.gameService.createGame(
            player1,
            player2,
            game.mode,
            "Friend Req",
            game.timeInMinutes,
            game.timeIncrementPerMoveSeconds,
        );

        return { socketId, gameInstance };
    }

    async rejectFriendGameInvite(
        receiver: User,
        { notificationId }: ManageFriendGameInviteDto,
    ) {
        const { socketId } = await this.manageFriendGameInvite(
            receiver,
            notificationId,
        );

        return socketId;
    }

    async getAllNotifications(userId: number) {
        return this.notificationRepository.find({
            where: { userWhoReceive: { userId } },
            order: { timeStamp: "DESC" },
        });
    }

    async markAllAsRead(userId: number) {
        await this.notificationRepository.update(
            { userWhoReceive: { userId } },
            { isRead: true },
        );
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteAllRead() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        await this.notificationRepository.delete({
            isRead: true,
            timeStamp: LessThan(oneWeekAgo),
        });
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
        const newNotification = this.notificationRepository.create({
            userWhoSend: {
                userId: sender.userId,
                nickname: sender.nickname,
                userAvatarImg: sender.userAvatarImg,
            },
            userWhoReceive: {
                userId: receiver.userId,
                nickname: receiver.nickname,
                userAvatarImg: receiver.userAvatarImg,
            },
            type: notificationTypes.REQUEST_TO_BE_FRIEND,
            title: "New Friend Request",
            message: "has sent you a friend request!",
            actionText1: "Accept",
            actionLink1: "notif:acceptFriendRequest",
            actionText2: "Reject",
            actionLink2: "notif:rejectFriendRequest",
            timeStamp: new Date(),
        });
        await this.notificationRepository.save(newNotification);

        // 2. Send notification to receiver
        const socketId = this.activeUsers.get(receiverId);

        return { socketId, newNotification };
    }

    async manageFriendRequest(receiver: User, notificationId: number) {
        const notification = await this.notificationRepository.findOneBy({
            notificationId,
            type: notificationTypes.REQUEST_TO_BE_FRIEND,
        });

        if (!notification) throw new WsException("Notification not found");
        if (notification.userWhoReceive.userId !== receiver.userId)
            throw new WsException("You are not allowed to perform this action");

        await this.notificationRepository.delete({
            type: notificationTypes.REQUEST_TO_BE_FRIEND,
            userWhoSend: { userId: receiver.userId },
        });

        await this.notificationRepository.delete({ notificationId });
        const socketId = this.activeUsers.get(notification.userWhoSend.userId);

        return { socketId, notification };
    }

    async acceptFriendRequest(receiver: User, { notificationId }: any) {
        const { socketId, notification } = await this.manageFriendRequest(
            receiver,
            notificationId,
        );

        //TODO: Call function when it gets implemented
        //await this.userService.addFriend(receiver.userId, notification.userWhoSend.userId);

        const newNotification = this.notificationRepository.create({
            userWhoReceive: {
                userId: notification.userWhoSend.userId,
                nickname: notification.userWhoSend.nickname,
                userAvatarImg: notification.userWhoSend.userAvatarImg,
            },
            type: notificationTypes.ACCEPTED_FRIEND_REQUEST,
            title: "Friend Request Accepted",
            message: "has accepted your friend request!",
            timeStamp: new Date(),
        });

        return { socketId, newNotification };
    }

    async rejectFriendRequest(receiver: User, { notificationId }: any) {
        await this.manageFriendRequest(receiver, notificationId);

        return;
    }
}
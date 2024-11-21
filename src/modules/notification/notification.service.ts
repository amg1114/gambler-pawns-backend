import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    Notification,
    notificationTypes,
} from "./entities/notification.entity";
import { Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { FriendGameInviteDto } from "./dto/friendGameInvite.dto";
import { WsException } from "@nestjs/websockets";
import { ManageFriendGameInviteDto } from "./dto/manageFriendGameInvite.dto";

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
    ) {}

    public activeUsers = new Map<number, string>(); // userId -> socket.id

    async sendFriendGameInvite(
        sender: User,
        { receiverId }: FriendGameInviteDto,
    ) {
        //TODO: Check if both users are friends
        // 1. Create new notification (save in DB)
        const receiver = await this.userRepository.findOneBy({
            userId: receiverId,
        });
        if (!receiver) throw new WsException("User not found");

        //TODO: Not send the full user object, just the important stuff
        const newNotification = this.notificationRepository.create({
            userWhoSend: sender,
            userWhoReceive: receiver,
            type: notificationTypes.WANTS_TO_PLAY,
            // TODO: actionLink1: "",
            title: "New Game Invite",
            message: "has invited you to play a game!",
            timeStamp: new Date(),
        });
        await this.notificationRepository.save(newNotification);

        // 2. Send notification to receiver
        const socketId = this.activeUsers.get(receiverId);

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

        await this.notificationRepository.delete({ notificationId: notifId });

        return this.activeUsers.get(notification.userWhoSend.userId);
    }

    async acceptFriendGameInvite(
        receiver: User,
        { notificationId }: ManageFriendGameInviteDto,
    ) {
        const socketId = await this.manageFriendGameInvite(
            receiver,
            notificationId,
        );
        // connect players in case userWhoSend is online
        return socketId;
    }

    async rejectFriendGameInvite(
        receiver: User,
        { notificationId }: ManageFriendGameInviteDto,
    ) {
        const socketId = await this.manageFriendGameInvite(
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
}

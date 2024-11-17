import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Notification } from "./entities/notification.entity";
import { Repository } from "typeorm";
import { NotificationType } from "./entities/notificationType.entity";
import { User } from "../user/entities/user.entity";
import { FriendGameInviteDto } from "./dto/friendGameInvite.dto";

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(NotificationType)
        private notificationTypeRepository: Repository<NotificationType>,
    ) {}

    async friendGameInvite(
        senderId,
        senderNickname,
        { receiverId }: FriendGameInviteDto,
    ) {
        const sender = await this.userRepository.findOneBy({
            userId: senderId,
        });
        const receiver = await this.userRepository.findOneBy({
            userId: receiverId,
        });
        if (!sender || !receiver) {
            throw new NotFoundException("Sender and/or receiver not found");
        }

        const notificationType = await this.notificationTypeRepository.findOne({
            where: { notificationTypeId: 1 }, // wants to play with you
        });

        /*         const newNotification = this.notificationRepository.create({
            userWhoSend: Promise.resolve(sender),
            userWhoReceive: Promise.resolve(receiver),
            notificationType: notificationType,
            title: `${senderNickname} wants to play a game with you`,
            message: `${senderNickname} has invited you to play a game.`,
            timeStamp: new Date(),
        });
        console.log(newNotification);
        await this.notificationRepository.save(newNotification); */
    }
}

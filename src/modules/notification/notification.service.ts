import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    Notification,
    notificationTypes,
} from "./entities/notification.entity";
import { Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { FriendGameInviteDto } from "./dto/friendGameInvite.dto";

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
    ) {}

    async friendGameInvite(
        senderId,
        senderNickname,
        { receiverId }: FriendGameInviteDto,
    ) {
        const receiver = await this.userRepository.findOneBy({
            userId: receiverId,
        });
        if (!receiver) throw new NotFoundException("User not found");

        const newNotification = this.notificationRepository.create({
            userWhoSend: { userId: senderId },
            userWhoReceive: { userId: receiverId },
            type: notificationTypes.WANTS_TO_PLAY,
            title: "New Game Invite",
            message: `${senderNickname} has invited you to play a game!`,
            timeStamp: new Date(),
        });
        await this.notificationRepository.save(newNotification);
    }
}

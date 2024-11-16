import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Notification } from "./entities/notification.entity";
import { Repository } from "typeorm";
import { NotificationType } from "./entities/notificationType.entity";

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(NotificationType)
        private notificationTypeRepository: Repository<NotificationType>,
    ) {}

    async friendGameInvite(senderId, receiverId) {
        const notificationType = await this.notificationTypeRepository.findOne({
            where: { notificationTypeId: 1 }, // wants to play with you
        });

        const newNotification = this.notificationRepository.create({
            userWhoSend: senderId,
            userWhoReceive: receiverId,
            notificationType: notificationType,
        });
        await this.notificationRepository.save(newNotification);
    }
}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationType } from "./entities/notificationType.entity";
import { Notification } from "./entities/notification.entity";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { NotificationGateway } from "./notification.gateway";
import { User } from "../user/entities/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Notification, NotificationType, User])],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationGateway],
})
export class NotificationsModule {}

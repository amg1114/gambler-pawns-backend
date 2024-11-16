import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationType } from "./entities/notificationType.entity";
import { Notification } from "./entities/notification.entity";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { NotificationGateway } from "./notification.gateway";

@Module({
    imports: [TypeOrmModule.forFeature([Notification, NotificationType])],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationGateway],
})
export class NotificationsModule {}

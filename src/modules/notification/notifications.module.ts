import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationType } from "./entities/notificationType.entity";
import { Notification } from "./entities/notification.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Notification, NotificationType])],
})
export class NotificationsModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./entities/notification.entity";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { NotificationGateway } from "./notification.gateway";
import { User } from "../user/entities/user.entity";
import { UserModule } from "../user/user.module";
import { ChessModule } from "../chess/chess.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, User]),
        UserModule,
        ChessModule,
    ],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationGateway],
})
export class NotificationsModule {}

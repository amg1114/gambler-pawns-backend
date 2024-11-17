import { Req, UseGuards } from "@nestjs/common";
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import { AuthWsGuard } from "src/common/guards/authWs.guard";
import { NotificationService } from "./notification.service";
import { FriendGameInviteDto } from "./dto/friendGameInvite.dto";

@WebSocketGateway()
@UseGuards(AuthWsGuard)
export class NotificationGateway {
    constructor(private notificationService: NotificationService) {}

    @SubscribeMessage("notif:invite-friend")
    handleFriendGameInvite(
        @MessageBody() data: FriendGameInviteDto,
        @Req() req: any,
    ) {
        const { userId, nickname } = req.user;
        return this.notificationService.friendGameInvite(
            userId,
            nickname,
            data,
        );
    }
}

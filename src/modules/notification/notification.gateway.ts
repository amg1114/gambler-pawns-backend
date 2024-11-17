import {
    Req,
    UseFilters,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import { AuthWsGuard } from "src/common/guards/authWs.guard";
import { NotificationService } from "./notification.service";
import { FriendGameInviteDto } from "./dto/friendGameInvite.dto";
import { ParseJsonPipe } from "src/common/websockets-utils/websocketParseJson.filter";
import { CustomWsFilterException } from "src/common/websockets-utils/websocket.filter";
import { CORS } from "src/config/constants";

@UseFilters(new CustomWsFilterException())
@UsePipes(new ParseJsonPipe(), new ValidationPipe({ transform: true }))
@UseGuards(AuthWsGuard)
@WebSocketGateway({
    cors: CORS,
})
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

import { Req, UseGuards } from "@nestjs/common";
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import { AuthWsGuard } from "src/common/guards/authWs.guard";

@WebSocketGateway()
@UseGuards(AuthWsGuard)
export class NotificationGateway {
    @SubscribeMessage("notif:invite-friend")
    handleFriendGameInvite(@MessageBody() data: any, @Req() req: any) {
        console.log(req.user);
        return "Hello world!" + data;
    }
}

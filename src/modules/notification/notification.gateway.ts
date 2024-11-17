import {
    Req,
    UseFilters,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { AuthWsGuard } from "src/common/guards/authWs.guard";
import { NotificationService } from "./notification.service";
import { FriendGameInviteDto } from "./dto/friendGameInvite.dto";
import { ParseJsonPipe } from "src/common/websockets-utils/websocketParseJson.filter";
import { CustomWsFilterException } from "src/common/websockets-utils/websocket.filter";
import { CORS } from "src/config/constants";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";

@UseFilters(new CustomWsFilterException())
@UsePipes(new ParseJsonPipe(), new ValidationPipe({ transform: true }))
@UseGuards(AuthWsGuard)
@WebSocketGateway({
    cors: CORS,
})
export class NotificationGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    constructor(
        private notificationService: NotificationService,
        private readonly jwtService: JwtService,
    ) {}

    @WebSocketServer()
    server: Server;

    async handleConnection(client: Socket) {
        console.log(`NOTIFICATION GATEWAY: Client connected: ${client.id}`);
        const { token } = client.handshake.auth;

        try {
            const { userId } = await this.jwtService.verifyAsync(token);
            this.notificationService.activeUsers.set(userId, client.id);
        } catch (e) {
            console.log("Invalid token provided");
            return client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`NOTIFICATION GATEWAY: Client disconnected: ${client.id}`);
    }

    @SubscribeMessage("notif:friendGameInvite")
    async handleFriendGameInvite(
        @MessageBody() data: FriendGameInviteDto,
        @Req() req: any,
    ) {
        const { socketId, newNotification } =
            await this.notificationService.sendFriendGameInvite(req.user, data);

        if (!socketId) return console.log("User is not online");
        this.server.to(socketId).emit("notif:game-invitation", newNotification);
    }

    /*     @SubscribeMessage("notif:acceptFriendGameInvite")
    async handleAcceptFriendGameInvite(
        @MessageBody() data: { notificationId: number },
        @Req() req: any,
    ) {
        const { socketId, newNotification } =
            await this.notificationService.acceptFriendGameInvite(req.user, data);

        if (!socketId) return console.log("User is not online");
        this.server.to(socketId).emit("notif:game-invitation", newNotification);
    } */
}

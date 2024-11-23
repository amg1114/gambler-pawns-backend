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
import { ManageFriendGameInviteDto } from "./dto/manageFriendGameInvite.dto";
import { ManageFriendRequestDto } from "./dto/manageFriendRequest.dto";
import { FriendRequestDto } from "./dto/friendRequest.dto";

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
        const { token } = client.handshake.auth;

        try {
            const { userId } = await this.jwtService.verifyAsync(token);
            this.notificationService.addActiveUser(userId, client.id);
        } catch (e) {
            console.log("Invalid token provided");
            return client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.notificationService.removeActiveUser(client.id);
    }

    @SubscribeMessage("notif:friendGameInvite")
    async handleFriendGameInvite(
        @MessageBody() data: FriendGameInviteDto,
        @Req() req: any,
    ) {
        const { socketId, newNotification } =
            await this.notificationService.sendFriendGameInvite(req.user, data);

        if (!socketId) return console.log("User is not online");
        this.server.to(socketId).emit("notif.game-invitation", newNotification);
    }

    @SubscribeMessage("notif:acceptFriendGameInvite")
    async handleAcceptFriendGameInvite(
        @MessageBody() data: ManageFriendGameInviteDto,
        @Req() req: any,
    ) {
        const { socketId, gameInstance } =
            await this.notificationService.acceptFriendGameInvite(
                req.user,
                data,
            );
        if (!socketId)
            return console.log("acceptFriendGameInvite: User is not online");
        this.server
            .to(socketId)
            .emit("notif.game-invitation.accepted", gameInstance);
        //TODO: should I also send the gameInstance to the user who accepted the invite?
    }

    @SubscribeMessage("notif:rejectFriendGameInvite")
    async handleRejectFriendGameInvite(
        @MessageBody() data: ManageFriendGameInviteDto,
        @Req() req: any,
    ) {
        const socketId = await this.notificationService.rejectFriendGameInvite(
            req.user,
            data,
        );
        if (!socketId)
            return console.log("rejectFriendGameInvite: User is not online");
        this.server
            .to(socketId)
            .emit("notif.game-invitation.rejected", "notificationRejected");
    }

    @SubscribeMessage("notif:friendRequest")
    async handleFriendRequest(
        @MessageBody() data: FriendRequestDto,
        @Req() req: any,
    ) {
        const { socketId, newNotification } =
            await this.notificationService.sendFriendRequest(req.user, data);

        this.server.to(socketId).emit("notif.friendRequest", newNotification);
    }

    @SubscribeMessage("notif:acceptFriendRequest")
    async handleAcceptFriendRequest(
        @MessageBody() data: ManageFriendRequestDto,
        @Req() req: any,
    ) {
        const { socketId, newNotification } =
            await this.notificationService.acceptFriendRequest(req.user, data);

        if (!socketId) return console.log("User is not online");
        this.server
            .to(socketId)
            .emit("notif.friendRequest.accepted", newNotification);
    }

    @SubscribeMessage("notif:rejectFriendRequest")
    async handleRejectFriendRequest(
        @MessageBody() data: ManageFriendRequestDto,
        @Req() req: any,
    ) {
        return await this.notificationService.rejectFriendRequest(
            req.user,
            data,
        );
    }
}

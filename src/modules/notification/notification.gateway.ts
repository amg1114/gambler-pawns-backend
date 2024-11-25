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
    WebSocketServer,
    WsException,
} from "@nestjs/websockets";
import { AuthWsGuard } from "src/common/guards/authWs.guard";
import { NotificationService } from "./notification.service";
import { FriendGameInviteDto } from "./dto/friendGameInvite.dto";
import { ParseJsonPipe } from "src/common/websockets-utils/websocketParseJson.filter";
import { CustomWsFilterException } from "src/common/websockets-utils/websocket.filter";
import { CORS } from "src/config/constants";
import { Server } from "socket.io";
import { ManageFriendGameInviteDto } from "./dto/manageFriendGameInvite.dto";
import { ManageFriendRequestDto } from "./dto/manageFriendRequest.dto";
import { FriendRequestDto } from "./dto/friendRequest.dto";

@UseFilters(new CustomWsFilterException())
@UsePipes(new ParseJsonPipe(), new ValidationPipe({ transform: true }))
@UseGuards(AuthWsGuard)
@WebSocketGateway({
    cors: CORS,
})
export class NotificationGateway {
    @WebSocketServer()
    server: Server;

    constructor(private notificationService: NotificationService) {}

    @SubscribeMessage("notif:friendGameInvite")
    async handleFriendGameInvite(
        @MessageBody() data: FriendGameInviteDto,
        @Req() req: any,
    ) {
        const { socketId, newNotification } =
            await this.notificationService.sendFriendGameInvite(req.user, data);

        if (!socketId) throw new WsException("User is not online");

        this.server.to(socketId).emit("notif.new", newNotification);
    }

    @SubscribeMessage("notif:acceptFriendGameInvite")
    async handleAcceptFriendGameInvite(
        @MessageBody() data: ManageFriendGameInviteDto,
        @Req() req: any,
    ) {
        const { userWhoSendsSocketId, userWhoReceivesSocketId, gameData } =
            await this.notificationService.acceptFriendGameInvite(
                req.user,
                data,
            );
        if (!userWhoSendsSocketId)
            return console.log("acceptFriendGameInvite: User is not online");

        // TODO: en un futuro unir a los jugadores
        //const color = getRandomColor();
        //const oppositeColor = color === "white" ? "black" : "white";

        // Rooms based on userId
        const senderRoom = req.user.id;
        const receiverRoom = gameData.playerBlack.userInfo.userId.toString();

        // Room based on gameId
        const gameRoom = gameData.gameId;

        // Add players to their user-based rooms
        this.server.sockets.sockets.get(userWhoSendsSocketId)?.join(senderRoom);
        this.server.sockets.sockets
            .get(userWhoReceivesSocketId)
            ?.join(receiverRoom);

        // Add both players to the game room
        this.server.sockets.sockets.get(userWhoSendsSocketId)?.join(gameRoom);
        this.server.sockets.sockets
            .get(userWhoReceivesSocketId)
            ?.join(gameRoom);

        // Notify players and send required data
        this.server.to(userWhoSendsSocketId).emit("game:started", {
            color: "white",
            ...gameData,
        });
        this.server.to(userWhoReceivesSocketId).emit("game:started", {
            color: "black",
            ...gameData,
        });
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

        this.server.to(socketId).emit("notif.new", "notificationRejected");
    }

    @SubscribeMessage("notif:friendRequest")
    async handleFriendRequest(
        @MessageBody() data: FriendRequestDto,
        @Req() req: any,
    ) {
        const { socketId, newNotification } =
            await this.notificationService.sendFriendRequest(req.user, data);

        this.server.to(socketId).emit("notif.new", newNotification);
    }

    @SubscribeMessage("notif:acceptFriendRequest")
    async handleAcceptFriendRequest(
        @MessageBody() data: ManageFriendRequestDto,
        @Req() req: any,
    ) {
        const { socketId, newNotification } =
            await this.notificationService.acceptFriendRequest(req.user, data);

        if (!socketId) return console.log("User is not online");

        this.server.to(socketId).emit("notif.new", newNotification);
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

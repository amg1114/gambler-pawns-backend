import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CORS } from "src/config/constants";
import { CustomWsFilterException } from "src/common/websockets-utils/websocket.filter";
import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { ParseJsonPipe } from "src/common/websockets-utils/websocketParseJson.filter";
import { CreateGameLinkDto } from "./dto/game-link.dto";
import { GameLinkService } from "./game-link.service";
import { GameJoinLinkDto } from "./dto/gameJoin-link.dto";

@UseFilters(new CustomWsFilterException())
@UsePipes(new ParseJsonPipe(), new ValidationPipe({ transform: true }))
@WebSocketGateway(CORS)
export class GameLinkGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly gameService: GameLinkService) {}

    @SubscribeMessage("game:createLink")
    async handleCreateLink(
        @MessageBody() payload: CreateGameLinkDto,
        @ConnectedSocket() socket: Socket,
    ) {
        return await this.gameService.createGameLink(payload, socket.id);
    }

    @SubscribeMessage("game:joinWithLink")
    async handleJoinWithLink(
        @MessageBody() { userId, gameLink }: GameJoinLinkDto,
        @ConnectedSocket() socket: Socket,
    ) {
        const result = await this.gameService.startGameByLink(gameLink, userId);
        if (!result) return;

        const { player1Socket, gameData } = result;

        // Join players to their own rooms
        socket.join(gameData.playerBlack.userInfo.userId.toString());
        socket.join(gameData.gameId);

        const opponentSocket = this.server.sockets.sockets.get(player1Socket);
        if (opponentSocket) {
            opponentSocket.join(gameData.gameId);
            opponentSocket.join(
                gameData.playerWhite.userInfo.userId.toString(),
            );
        }

        // Notify players and send required data
        this.server.to(player1Socket).emit("game:started", {
            color: "white",
            ...gameData,
        });
        this.server.to(socket.id).emit("game:started", {
            color: "black",
            ...gameData,
        });

        // TODO: if user player A disconnects delete from map of game links
    }
}

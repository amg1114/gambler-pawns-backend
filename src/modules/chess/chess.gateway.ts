import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CORS } from "../../config/constants";
import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { CustomWsFilterException } from "../../common/websockets-utils/websocket.filter";
import { ParseJsonPipe } from "src/common/websockets-utils/websocketParseJson.filter";
import { ActiveGamesService } from "./submodules/active-games/active-games.service";

@UseFilters(new CustomWsFilterException())
@UsePipes(new ParseJsonPipe(), new ValidationPipe({ transform: true }))
@WebSocketGateway({
    cors: CORS,
})
/** Handle connections and reconnections */
export class ChessGateway implements OnGatewayConnection, OnGatewayDisconnect {
    // TODO: implement /game namespace acrross all gateways of the chess module

    @WebSocketServer()
    server: Server;

    constructor(private readonly activeGamesService: ActiveGamesService) {}

    // log connected and disconnected clients for debugging purposes
    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);

        const playerId = this.activeGamesService.findPlayerIdBySocketId(
            client.id,
        );

        if (playerId) {
            this.activeGamesService.unRegisterPlayerSocket(playerId);
        }
    }

    // handle recconnection of clients
    @SubscribeMessage("game:reconnect")
    handleReconnect(
        @MessageBody()
        payload: { playerId: string; gameId: string },
        @ConnectedSocket() socket: Socket,
    ) {
        const { playerId, gameId } = payload;
        console.log(
            `Player ${playerId} attempting to reconnect to game ${gameId}`,
        );

        const game = this.activeGamesService.findGameByPlayerId(playerId);
        if (game && game.gameId === gameId) {
            socket.join(gameId);
            // update players map with new socket id
            this.activeGamesService.registerPlayerSocket(playerId, socket.id);
            console.log(
                `Player ${playerId} reconnected with socket ID ${socket.id}`,
            );

            // send game data to reconnected client
            socket.emit("game:reconnected", {
                color:
                    game.whitesPlayer.playerId === playerId ? "white" : "black",
                board: game.board.fen(),
                moveHistory: game.board.history(),
            });
        } else {
            socket.emit("error", {
                message: "No game found or invalid gameId",
            });
        }
    }
}

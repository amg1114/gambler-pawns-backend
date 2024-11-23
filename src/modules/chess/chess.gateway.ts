import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CORS } from "../../config/constants";
import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { CustomWsFilterException } from "../../common/websockets-utils/websocket.filter";
import { ParseJsonPipe } from "src/common/websockets-utils/websocketParseJson.filter";
import { ActiveGamesService } from "./submodules/active-games/active-games.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@UseFilters(new CustomWsFilterException())
@UsePipes(new ParseJsonPipe(), new ValidationPipe({ transform: true }))
@WebSocketGateway({
    cors: CORS,
})
/** Handle connections and reconnections */
export class ChessGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly activeGamesService: ActiveGamesService,
        private eventEmitter: EventEmitter2,
    ) {}

    // log connected and disconnected clients for debugging purposes
    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    // TODO: maybe is better to have a namespace for the game
    handleDisconnect(client: Socket) {
        this.eventEmitter.emit("game.checkIfRandomPairingIsAborted", {
            socketId: client.id,
        });
        console.log(`Client disconnected: ${client.id}`);
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

            const whitePlayerId = game.whitesPlayer.userInfo.userId.toString();
            const blackPlayerId = game.blacksPlayer.userInfo.userId.toString();

            // join player to its own room in order to send private messages
            if (playerId === whitePlayerId) {
                socket.join(whitePlayerId);
            } else {
                socket.join(blackPlayerId);
            }

            // send game data to reconnected client
            socket.emit("game:reconnected", {
                color: whitePlayerId === playerId ? "white" : "black",
                board: game.board.fen(),
                pgn: game.board.pgn(),
                moveHistory: game.board.history(),
            });
        } else {
            throw new WsException("Invalid game or player id");
        }
    }
}

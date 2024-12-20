import {
    WebSocketGateway,
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

@UseFilters(new CustomWsFilterException())
@UsePipes(new ParseJsonPipe(), new ValidationPipe({ transform: true }))
@WebSocketGateway({
    cors: CORS,
})
/** Handle connections and reconnections */
export class ChessGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly activeGamesService: ActiveGamesService) {}

    // handle recconnection of clients
    @SubscribeMessage("game:reconnect")
    handleReconnect(
        @MessageBody()
        payload: { gameId: string },
        @ConnectedSocket() socket: Socket,
    ) {
        const { gameId } = payload;
        const { playerId } = socket.handshake.auth;

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

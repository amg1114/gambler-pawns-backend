import { UseFilters, ValidationPipe } from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CORS } from "src/config/constants";
// ws utils
import { CustomWsFilterException } from "src/common/websockets-utils/websocket.filter";
import { ParseJsonPipe } from "src/common/websockets-utils/websocketParseJson.filter";
// dtos
import { MakeMoveDTO } from "./dto/makeMove.dto";
import { ActiveGamesService } from "../active-games/active-games.service";
import { GameService } from "./game.service";

@UseFilters(new CustomWsFilterException())
@WebSocketGateway({
    cors: CORS,
})
export class HandleGameGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly gameService: GameService,
        private readonly activeGamesService: ActiveGamesService,
    ) {}

    @SubscribeMessage("game:makeMove")
    async handleMakeMove(
        @MessageBody(
            new ParseJsonPipe(),
            new ValidationPipe({ transform: true }),
        )
        payload: MakeMoveDTO,
        @ConnectedSocket() socket: Socket,
    ) {
        console.log("Making move", payload);
        const result = await this.gameService.playerMove(payload.playerId, {
            from: payload.from,
            to: payload.to,
        });

        if (result.error) {
            socket.emit("moveError", result.error);
        } else if (result.gameOver) {
            const game = this.activeGamesService.findGameByPlayerId(
                payload.playerId,
            );
            if (game) {
                const player1Socket =
                    this.activeGamesService.getSocketIdByPlayerId(
                        game.whitesPlayer.playerId,
                    );
                const player2Socket =
                    this.activeGamesService.getSocketIdByPlayerId(
                        game.blacksPlayer.playerId,
                    );

                if (player1Socket && player2Socket) {
                    this.server
                        .to(player1Socket)
                        .emit("gameOver", { winner: result.winner });
                    this.server
                        .to(player2Socket)
                        .emit("gameOver", { winner: result.winner });
                }
            }
        } else {
            const game = this.activeGamesService.findGameByPlayerId(
                payload.playerId,
            );
            if (game) {
                const player1Socket =
                    this.activeGamesService.getSocketIdByPlayerId(
                        game.whitesPlayer.playerId,
                    );
                const player2Socket =
                    this.activeGamesService.getSocketIdByPlayerId(
                        game.blacksPlayer.playerId,
                    );

                if (player1Socket && player2Socket) {
                    this.server.to(player1Socket).emit("moveMade", result);
                    this.server.to(player2Socket).emit("moveMade", result);
                }
            }
        }
    }

    @SubscribeMessage("game:resign")
    handleResign(
        @MessageBody(
            new ParseJsonPipe(),
            new ValidationPipe({ transform: true }),
        )
        payload: { playerId: string },
        //@ConnectedSocket() socket: Socket,
    ) {
        const result = this.gameService.handleResign(payload.playerId);

        if (result && result.gameInstance) {
            const player1Socket = this.activeGamesService.getSocketIdByPlayerId(
                result.gameInstance.whitesPlayer.playerId,
            );
            const player2Socket = this.activeGamesService.getSocketIdByPlayerId(
                result.gameInstance.blacksPlayer.playerId,
            );

            if (player1Socket && player2Socket) {
                this.server.to(player1Socket).emit("gameOver", {
                    winner: result.winner,
                    reason: "resign",
                });
                this.server.to(player2Socket).emit("gameOver", {
                    winner: result.winner,
                    reason: "resign",
                });
            }
        }
    }
}

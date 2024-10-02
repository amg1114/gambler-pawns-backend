import { ValidationPipe } from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { ParseJsonPipe } from "src/websocketsUtils";
import { AcceptDrawDTO, MakeMoveDTO, OfferDrawDTO } from "./dto";
import { Server, Socket } from "socket.io";
import { CORS } from "src/config/constants";
import { HandleGameService } from "./handle-game.service";

@WebSocketGateway({
    cors: CORS,
})
export class HandleGameGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly hangleGameService: HandleGameService) {}

    @SubscribeMessage("message")
    handleMessage(client: any, payload: any): string {
        return "Hello world!";
    }

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
        const result = await this.hangleGameService.handleMove(
            payload.playerId,
            {
                from: payload.from,
                to: payload.to,
            },
        );

        if (result.error) {
            socket.emit("moveError", result.error);
        } else if (result.gameOver) {
            const game = this.hangleGameService.findGameByPlayerId(
                payload.playerId,
            );
            if (game) {
                const player1Socket =
                    this.hangleGameService.getSocketIdByPlayerId(
                        game.whitesPlayer.playerId,
                    );
                const player2Socket =
                    this.hangleGameService.getSocketIdByPlayerId(
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
            const game = this.hangleGameService.findGameByPlayerId(
                payload.playerId,
            );
            if (game) {
                const player1Socket =
                    this.hangleGameService.getSocketIdByPlayerId(
                        game.whitesPlayer.playerId,
                    );
                const player2Socket =
                    this.hangleGameService.getSocketIdByPlayerId(
                        game.blacksPlayer.playerId,
                    );

                if (player1Socket && player2Socket) {
                    this.server.to(player1Socket).emit("moveMade", result);
                    this.server.to(player2Socket).emit("moveMade", result);
                }
            }
        }
    }

    @SubscribeMessage("game:offerDraw")
    handleOfferDraw(
        @MessageBody(
            new ParseJsonPipe(),
            new ValidationPipe({ transform: true }),
        )
        payload: OfferDrawDTO,
        //@ConnectedSocket() socket: Socket,
    ) {
        const game = this.hangleGameService.findGameByPlayerId(
            payload.playerId,
        );
        if (game) {
            const opponentSocket = this.hangleGameService.getSocketIdByPlayerId(
                game.getOpponentId(payload.playerId),
            );
            if (opponentSocket) {
                this.server.to(opponentSocket).emit("drawOffered", {
                    playerId: payload.playerId,
                    gameId: game.gameId,
                });
            }
        }
    }

    @SubscribeMessage("game:acceptDraw")
    handleAcceptDraw(
        @MessageBody(
            new ParseJsonPipe(),
            new ValidationPipe({ transform: true }),
        )
        payload: AcceptDrawDTO,
        //@ConnectedSocket() socket: Socket,
    ) {
        const game = this.hangleGameService.findGameByPlayerId(
            payload.playerId,
        );
        if (game) {
            game.endGame("Draw");
            const player1Socket = this.hangleGameService.getSocketIdByPlayerId(
                game.whitesPlayer.playerId,
            );
            const player2Socket = this.hangleGameService.getSocketIdByPlayerId(
                game.blacksPlayer.playerId,
            );
            this.server.to(player1Socket).emit("gameOver", { winner: "draw" });
            this.server.to(player2Socket).emit("gameOver", { winner: "draw" });
        }
    }

    @SubscribeMessage("game:rejectDraw")
    handleRejectDraw(
        @MessageBody(
            new ParseJsonPipe(),
            new ValidationPipe({ transform: true }),
        )
        payload: AcceptDrawDTO,
        //@ConnectedSocket() socket: Socket,
    ) {
        const game = this.hangleGameService.findGameByPlayerId(
            payload.playerId,
        );
        if (game) {
            const opponentSocket = this.hangleGameService.getSocketIdByPlayerId(
                game.getOpponentId(payload.playerId),
            );
            if (opponentSocket) {
                this.server.to(opponentSocket).emit("drawRejected", {
                    playerId: payload.playerId,
                });
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
        const result = this.hangleGameService.handleResign(payload.playerId);

        if (result && result.game) {
            const player1Socket = this.hangleGameService.getSocketIdByPlayerId(
                result.game.whitesPlayer.playerId,
            );
            const player2Socket = this.hangleGameService.getSocketIdByPlayerId(
                result.game.blacksPlayer.playerId,
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

    // handle recconnection
    @SubscribeMessage("game:reconnect")
    handleReconnect(
        @MessageBody(
            new ParseJsonPipe(),
            new ValidationPipe({ transform: true }),
        ) // TODO: add DTO here
        payload: { playerId: string; gameId: string },
        @ConnectedSocket() socket: Socket,
    ) {
        const { playerId, gameId } = payload;
        console.log(
            `Player ${playerId} attempting to reconnect to game ${gameId}`,
        );

        const game = this.hangleGameService.findGameByPlayerId(playerId);
        if (game && game.gameId === gameId) {
            // Actualizamos el socket del jugador en el mapa de jugadores y sockets
            this.hangleGameService.registerPlayerSocket(playerId, socket.id);
            console.log(
                `Player ${playerId} reconnected with socket ID ${socket.id}`,
            );

            // Enviamos los datos de la partida al jugador reconectado
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

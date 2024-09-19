// this file is responsible for handling websocket connections and messages related to chess game
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CORS } from "../config/constants";
import { GameChessManagerService } from "./chess.service";
import { JoinGameDTO, MakeMoveDTO, OfferDrawDTO, AcceptDrawDTO } from "./dto";
import { UseFilters, ValidationPipe } from "@nestjs/common";
import { CustomWsFilterException, ParseJsonPipe } from "../websocketsUtils";

@UseFilters(CustomWsFilterException)
@WebSocketGateway({
    cors: CORS,
})
export class WebsocketGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    constructor(private readonly chessService: GameChessManagerService) {}

    // log connected and disconnected clients for debugging purposes
    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage("game:join")
    async handleJoinGame(
        @MessageBody(
            new ParseJsonPipe(),
            new ValidationPipe({ transform: true }),
        )
        payload: JoinGameDTO,
        @ConnectedSocket() socket: Socket,
    ) {
        console.log("Joining game", payload);
        const { playerId, eloRating, mode } = payload;

        // Register player and socket in chess service
        this.chessService.registerPlayerSocket(playerId, socket.id);

        const pairing = await this.chessService.addToPool(
            { playerId, eloRating, socketId: socket.id },
            mode,
        );

        if (pairing) {
            const { player1Socket, player2Socket, ...rest } = pairing;

            // Notify players and send required data
            this.server.to(player1Socket).emit("gameStart", {
                color: "white",
                opponent: player2Socket,
                ...rest,
            });
            this.server.to(player2Socket).emit("gameStart", {
                color: "black",
                opponent: player1Socket,
                ...rest,
            });
        }
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
        const result = await this.chessService.handleMove(payload.playerId, {
            from: payload.from,
            to: payload.to,
        });

        if (result.error) {
            socket.emit("moveError", result.error);
        } else if (result.gameOver) {
            const game = this.chessService.findGameByPlayerId(payload.playerId);
            if (game) {
                const player1Socket = this.chessService.getSocketIdByPlayerId(
                    game.whitesPlayer.playerId,
                );
                const player2Socket = this.chessService.getSocketIdByPlayerId(
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
            const game = this.chessService.findGameByPlayerId(payload.playerId);
            if (game) {
                const player1Socket = this.chessService.getSocketIdByPlayerId(
                    game.whitesPlayer.playerId,
                );
                const player2Socket = this.chessService.getSocketIdByPlayerId(
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
        const game = this.chessService.findGameByPlayerId(payload.playerId);
        if (game) {
            const opponentSocket = this.chessService.getSocketIdByPlayerId(
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
        const game = this.chessService.findGameByPlayerId(payload.playerId);
        if (game) {
            game.endGame("Draw");
            const player1Socket = this.chessService.getSocketIdByPlayerId(
                game.whitesPlayer.playerId,
            );
            const player2Socket = this.chessService.getSocketIdByPlayerId(
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
        const game = this.chessService.findGameByPlayerId(payload.playerId);
        if (game) {
            const opponentSocket = this.chessService.getSocketIdByPlayerId(
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
        const result = this.chessService.handleResign(payload.playerId);

        if (result && result.game) {
            const player1Socket = this.chessService.getSocketIdByPlayerId(
                result.game.whitesPlayer.playerId,
            );
            const player2Socket = this.chessService.getSocketIdByPlayerId(
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
}

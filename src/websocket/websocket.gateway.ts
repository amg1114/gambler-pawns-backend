// NOTE: this file is responsible for handling websocket connections and messages

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
import { CORS } from "../constants";
import { GameChessManagerService } from "./chess.service";
import { JoinGameDTO } from "./dto/joinGame.dto";
import { UseFilters, ValidationPipe } from "@nestjs/common";
import { CustomWsFilterException, ParseJsonPipe } from "../websocketsUtils/";

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

    @SubscribeMessage("joinGame")
    handleJoinGame(
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

        const pairing = this.chessService.addToPool(
            { playerId, eloRating, socketId: socket.id },
            mode,
        );

        if (pairing) {
            console.log("actually pairing");
            const { player1Socket, player2Socket } = pairing;
            console.log(player1Socket, player2Socket);

            // Notificar a los jugadores que han sido emparejados
            this.server
                .to(player1Socket)
                .emit("gameStart", { color: "white", opponent: player2Socket });
            this.server
                .to(player2Socket)
                .emit("gameStart", { color: "black", opponent: player1Socket });
        }
    }

    /*@SubscribeMessage("makeMove")
    handleMakeMove(
        @MessageBody()
        data: { playerId: string; move: { from: string; to: string } },
        @ConnectedSocket() socket: Socket,
    ) {
        const result = this.chessService.handleMove(data.playerId, data.move);

        if (result.error) {
            socket.emit("moveError", result.error);
        } else if (result.gameOver) {
            const game = this.chessService.findGameByPlayerId(data.playerId);
            if (game) {
                const player1Socket = this.chessService.getSocketIdByPlayerId(
                    game.player1.playerId,
                );
                const player2Socket = this.chessService.getSocketIdByPlayerId(
                    game.player2.playerId,
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
            const game = this.chessService.findGameByPlayerId(data.playerId);
            if (game) {
                const player1Socket = this.chessService.getSocketIdByPlayerId(
                    game.player1.playerId,
                );
                const player2Socket = this.chessService.getSocketIdByPlayerId(
                    game.player2.playerId,
                );

                if (player1Socket && player2Socket) {
                    this.server.to(player1Socket).emit("moveMade", result);
                    this.server.to(player2Socket).emit("moveMade", result);
                }
            }
        }
    }*/
}

import { UseFilters, ValidationPipe } from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CustomWsFilterException, ParseJsonPipe } from "src/websocketsUtils";
import { JoinGameDTO } from "./dto/joinGame.dto";
import { RandomPairingService } from "./random-pairing.service";
import { ChessService } from "../chess.service";

@UseFilters(CustomWsFilterException)
@WebSocketGateway()
export class RandomPairingGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly randomPairingService: RandomPairingService,
        private readonly chessService: ChessService,
    ) {}

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

        const pairing = await this.randomPairingService.addToPool(
            { playerId, eloRating, socketId: socket.id },
            mode,
        );

        if (pairing) {
            const { player1Socket, player2Socket, ...rest } = pairing;

            // Notify players and send required data
            this.server.to(player1Socket).emit("game:started", {
                color: "white",
                opponent: player2Socket,
                ...rest,
            });
            this.server.to(player2Socket).emit("game:started", {
                color: "black",
                opponent: player1Socket,
                ...rest,
            });
        }
    }
}

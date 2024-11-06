import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CustomWsFilterException } from "src/common/websockets-utils/websocket.filter";
import { ParseJsonPipe } from "src/common/websockets-utils/websocketParseJson.filter";
import { JoinGameDTO } from "./dto/joinGame.dto";
import { RandomPairingService } from "./random-pairing.service";
import { ActiveGamesService } from "../active-games/active-games.service";

@UseFilters(new CustomWsFilterException())
@UsePipes(new ParseJsonPipe(), new ValidationPipe({ transform: true }))
@WebSocketGateway()
export class RandomPairingGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly randomPairingService: RandomPairingService,
        private readonly activeGamesService: ActiveGamesService,
    ) {}

    @SubscribeMessage("game:join")
    async handleJoinGame(
        @MessageBody()
        payload: JoinGameDTO,
        @ConnectedSocket() socket: Socket,
    ) {
        console.log("Joining game", payload);
        const { playerId, eloRating, mode, initialTime, incrementTime } =
            payload;

        // Register player and socket in chess service
        this.activeGamesService.registerPlayerSocket(playerId, socket.id); // TODO: revisar

        const pairing = await this.randomPairingService.addToPool(
            {
                playerId,
                eloRating,
                initialTime,
                incrementTime,
                joinedAt: Date.now(),
                userData: undefined,
                socketId: socket.id,
            },
            mode,
        );

        if (pairing) {
            const { player1Socket, player2Socket, ...rest } = pairing;

            // join current paired player's socket to the game room
            socket.join(pairing.gameId);

            const opponentSocket = this.server.sockets.sockets.get(
                socket.id === player1Socket ? player2Socket : player1Socket,
            );

            if (opponentSocket) {
                opponentSocket.join(pairing.gameId);
            }

            // Notify players and send required data
            this.server.to(player1Socket).emit("game:started", {
                color: "white",
                ...rest,
            });
            this.server.to(player2Socket).emit("game:started", {
                color: "black",
                ...rest,
            });
        }
    }
}

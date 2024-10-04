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

// TODO: probar esto
@UseFilters(new CustomWsFilterException())
@UsePipes(new ValidationPipe(), new ParseJsonPipe())
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
        this.activeGamesService.registerPlayerSocket(playerId, socket.id);

        const pairing = await this.randomPairingService.addToPool(
            {
                playerId,
                eloRating,
                socketId: socket.id,
                initialTime,
                incrementTime,
            },
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

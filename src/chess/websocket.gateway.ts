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

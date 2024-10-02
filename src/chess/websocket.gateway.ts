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
}

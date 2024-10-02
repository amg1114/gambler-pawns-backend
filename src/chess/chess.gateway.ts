// this file is responsible for handling websocket connections and messages related to chess game
import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CORS } from "../config/constants";
import { UseFilters } from "@nestjs/common";
import { CustomWsFilterException } from "../websocketsUtils";

@UseFilters(CustomWsFilterException)
@WebSocketGateway({
    cors: CORS,
})
export class ChessGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // log connected and disconnected clients for debugging purposes
    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }
}

// this file is only responsible for handling the connection and disconnection of clients in the namespace /game
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

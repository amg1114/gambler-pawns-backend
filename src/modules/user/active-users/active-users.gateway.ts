import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
} from "@nestjs/websockets";
import { ActiveUsersService } from "./active-users.service";
import { Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { EventEmitter2 } from "@nestjs/event-emitter";

@WebSocketGateway()
export class ActiveUsersGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    constructor(
        private readonly activeUsersService: ActiveUsersService,
        private jwtService: JwtService,
        private eventEmitter: EventEmitter2,
    ) {}

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        const { token } = client.handshake.auth;

        try {
            const { userId } = await this.jwtService.verifyAsync(token);
            this.activeUsersService.addActiveUser(userId, client.id);
        } catch {
            // TODO: If not logged it, generate unique ID using the format 'guest - Date.now()' and store it in the activeUsersService
        }
    }

    handleDisconnect(client: Socket) {
        this.eventEmitter.emit("game.checkIfRandomPairingIsAborted", {
            socketId: client.id,
        });
        this.activeUsersService.removeActiveUser(client.id);
    }
}

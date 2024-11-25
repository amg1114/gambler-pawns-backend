import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { JoinGameLinkDto } from "./dto/game-link.dto";
import { GameLinkService } from "./game-link.service";

@WebSocketGateway()
export class GameLinkGateway {
    constructor(private gameLinkService: GameLinkService) {}

    @WebSocketServer()
    server: Server;

    @SubscribeMessage("game:joinViaLink")
    async handleMessage(@MessageBody() data: JoinGameLinkDto) {
        const { gameData, socketA, socketB } =
            await this.gameLinkService.joinGameLink(data);

        //FIXME: This is not working for guest users yet because of how the guest ID is implemented
        if (!socketA) return console.log("game:joinViaLink - Player A offline");

        // Rooms based on userId
        const senderRoom = data.userId;
        const receiverRoom = gameData.playerBlack.userInfo.userId.toString();

        // Room based on gameId
        const gameRoom = gameData.gameId;

        // Add players to their user-based rooms
        this.server.sockets.sockets.get(socketA)?.join(senderRoom);
        this.server.sockets.sockets.get(socketB)?.join(receiverRoom);

        // Add both players to the game room
        this.server.sockets.sockets.get(socketA)?.join(gameRoom);
        this.server.sockets.sockets.get(socketB)?.join(gameRoom);

        // Notify players and send required data
        this.server.to(socketA).emit("game:started", {
            color: "white",
            ...gameData,
        });
        this.server.to(socketB).emit("game:started", {
            color: "black",
            ...gameData,
        });
    }
}

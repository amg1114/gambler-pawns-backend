import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { OnEvent } from "@nestjs/event-emitter";
import { Server, Socket } from "socket.io";
import { CORS } from "src/config/constants";
// ws utils
import { CustomWsFilterException } from "src/common/websockets-utils/websocket.filter";
import { ParseJsonPipe } from "src/common/websockets-utils/websocketParseJson.filter";
// dtos
import { MakeMoveDTO } from "./dto/makeMove.dto";
// services
import { ActiveGamesService } from "../active-games/active-games.service";
import { GameService } from "./game.service";

@UseFilters(new CustomWsFilterException())
@UsePipes(new ParseJsonPipe(), new ValidationPipe({ transform: true }))
@WebSocketGateway({
    cors: CORS,
})
export class HandleGameGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly gameService: GameService,
        private readonly activeGamesService: ActiveGamesService,
    ) {}

    @SubscribeMessage("game:makeMove")
    async handleMakeMove(
        @MessageBody()
        payload: MakeMoveDTO,
        @ConnectedSocket() socket: Socket,
    ) {
        // TODO: validar que el mismo socket registrado sea quien haga la solicitud
        // TODO: pedir player id y game id para simplificar la logica
        const result = await this.gameService.playerMove(payload.playerId, {
            from: payload.from,
            to: payload.to,
        });

        if (result.error) {
            socket.emit("moveError", result.error);
        } else {
            const game = this.activeGamesService.findGameByPlayerId(
                payload.playerId,
            );
            if (game) {
                this.server.to(game.gameId).emit("moveMade", result);
            }
        }
    }

    @SubscribeMessage("game:resign")
    handleResign(
        @MessageBody()
        payload: { playerId: string },
        //@ConnectedSocket() socket: Socket,
    ) {
        // TODO: validar que el mismo socket que hace la petición este registrado en el juego
        this.gameService.handleResign(payload.playerId);
    }

    @OnEvent("game.end")
    endGame(payload: { gameId: string; resultData: any }) {
        this.server.to(payload.gameId).emit("gameEnd", payload.resultData);
    }
}

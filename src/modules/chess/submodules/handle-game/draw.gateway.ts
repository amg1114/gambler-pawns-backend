import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import {
    SubscribeMessage,
    WebSocketGateway,
    MessageBody,
    WsException,
    WebSocketServer,
    ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CORS } from "src/config/constants";

// ws utils
import { CustomWsFilterException } from "src/common/websockets-utils/websocket.filter";
import { ParseJsonPipe } from "src/common/websockets-utils/websocketParseJson.filter";
// dtos
import { AcceptDrawDTO } from "./dto/acceptDraw.dto";
import { OfferDrawDTO } from "./dto/offerDraw.dto";
// services
import { ActiveGamesService } from "../active-games/active-games.service";
import { DrawService } from "./draw.service";

@UseFilters(new CustomWsFilterException())
@UsePipes(new ParseJsonPipe(), new ValidationPipe({ transform: true }))
@WebSocketGateway({
    cors: CORS,
})
export class DrawGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly drawService: DrawService,
        private readonly activeGamesService: ActiveGamesService,
    ) {}

    @SubscribeMessage("game:offerDraw")
    handleOfferDraw(
        @MessageBody()
        payload: OfferDrawDTO,
        @ConnectedSocket() socket: Socket,
    ) {
        const { playerId } = socket.handshake.auth;
        // TODO: validar que el socket sea el mismo que el que se registró en el servicio
        const game = this.activeGamesService.findGameByPlayerId(playerId);
        if (!game) throw new WsException("Game not found");

        const drawOfferResult = this.drawService.offerDraw(
            payload.gameId,
            playerId,
        );
        if (drawOfferResult) {
            socket.to(payload.gameId).emit("drawOffered", {
                playerId: playerId,
                gameId: payload.gameId,
            });
        } else {
            throw new WsException("Draw offer already exists");
        }
    }

    @SubscribeMessage("game:acceptDraw")
    async handleAcceptDraw(
        @MessageBody()
        payload: AcceptDrawDTO,
        @ConnectedSocket() socket: Socket,
    ) {
        // TODO: validar que el socket sea el mismo que el que se registró en el servicio
        const { playerId } = socket.handshake.auth;
        await this.drawService.acceptDraw(payload.gameId, playerId);
    }

    @SubscribeMessage("game:rejectDraw")
    handleRejectDraw(
        @MessageBody()
        payload: AcceptDrawDTO,
        @ConnectedSocket() socket: Socket,
    ) {
        const { playerId } = socket.handshake.auth;

        // TODO: validar que el socket sea el mismo que el que se registró en el servicio
        const game = this.activeGamesService.findGameByPlayerId(playerId);
        if (!game) throw new WsException("Game not found");

        const drawRejected = this.drawService.rejectDraw(game.gameId);

        if (!drawRejected) {
            throw new WsException("No draw offer to reject");
        }

        socket.to(game.gameId).emit("drawRejected", {
            playerId: playerId,
        });
    }
}

import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import {
    SubscribeMessage,
    WebSocketGateway,
    MessageBody,
    WsException,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
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
        //@ConnectedSocket() socket: Socket,
    ) {
        // TODO: validar que el socket sea el mismo que el que se registró en el servicio
        const game = this.activeGamesService.findGameByPlayerId(
            payload.playerId,
        );
        if (!game) throw new WsException("Game not found");

        const drawOfferResult = this.drawService.offerDraw(
            game.gameId,
            payload.playerId,
        );
        if (drawOfferResult) {
            const opponentSocket =
                this.activeGamesService.getSocketIdByPlayerId(
                    this.drawService.getOpponentId(payload.playerId, game),
                );
            if (opponentSocket) {
                this.server.to(opponentSocket).emit("drawOffered", {
                    playerId: payload.playerId,
                    gameId: game.gameId,
                });
            }
        } else {
            throw new WsException("Draw offer already exists");
        }
    }

    @SubscribeMessage("game:acceptDraw")
    handleAcceptDraw(
        @MessageBody()
        payload: AcceptDrawDTO,
        //@ConnectedSocket() socket: Socket,
    ) {
        // TODO: validar que el socket sea el mismo que el que se registró en el servicio
        const game = this.activeGamesService.findGameByPlayerId(
            payload.playerId,
        );
        if (!game) throw new WsException("Game not found");

        const drawAccepted = this.drawService.acceptDraw(game.gameId);

        if (!drawAccepted) {
            throw new WsException("No draw offer to accept");
        }

        const player1Socket = this.activeGamesService.getSocketIdByPlayerId(
            game.whitesPlayer.playerId,
        );
        const player2Socket = this.activeGamesService.getSocketIdByPlayerId(
            game.blacksPlayer.playerId,
        );

        this.server.to(player1Socket).emit("gameOver", { winner: "draw" });
        this.server.to(player2Socket).emit("gameOver", { winner: "draw" });
    }

    @SubscribeMessage("game:rejectDraw")
    handleRejectDraw(
        @MessageBody()
        payload: AcceptDrawDTO,
        //@ConnectedSocket() socket: Socket,
    ) {
        // TODO: validar que el socket sea el mismo que el que se registró en el servicio
        const game = this.activeGamesService.findGameByPlayerId(
            payload.playerId,
        );
        if (!game) throw new WsException("Game not found");

        const drawRejected = this.drawService.rejectDraw(game.gameId);

        if (!drawRejected) {
            throw new WsException("No draw offer to reject");
        }

        const opponentSocket = this.activeGamesService.getSocketIdByPlayerId(
            this.drawService.getOpponentId(payload.playerId, game),
        );
        if (opponentSocket) {
            this.server
                .to(opponentSocket)
                .emit("drawRejected", { playerId: payload.playerId });
        }
    }
}

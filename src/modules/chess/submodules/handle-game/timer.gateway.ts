import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CORS } from "src/config/constants";
import { OnEvent } from "@nestjs/event-emitter";
import { CustomWsFilterException } from "src/common/websockets-utils/websocket.filter";
import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { ParseJsonPipe } from "src/common/websockets-utils/websocketParseJson.filter";

@UseFilters(new CustomWsFilterException())
@UsePipes(new ParseJsonPipe(), new ValidationPipe({ transform: true }))
@WebSocketGateway(CORS)
export class TimerGateway {
    @WebSocketServer()
    server: Server;

    // Escucha el evento cuando los jugadores solicitan la actualización de su tiempo
    @OnEvent("timer.updated")
    handleTimerUpdate(payload: {
        gameId: string;
        playerOneTime: number;
        playerTwoTime: number;
    }) {
        this.server.to(payload.gameId).emit("timerUpdate", {
            playerOneTime: payload.playerOneTime,
            playerTwoTime: payload.playerTwoTime,
        });
    }
}

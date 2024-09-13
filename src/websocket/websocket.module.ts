import { Module } from "@nestjs/common";
import { WebsocketGateway } from "./websocket.gateway";
import { GameChessManagerService } from "./chess.service";

@Module({
    providers: [WebsocketGateway, GameChessManagerService],
})
export class GatewayModule {}

import { Module } from "@nestjs/common";
import { WebsocketGateway } from "./websocket.gateway";
import { GameChessManagerService } from "./chess.service";
import { DrizzleModule } from "../drizzle/drizzle.module";

@Module({
    imports: [DrizzleModule],
    providers: [WebsocketGateway, GameChessManagerService],
})
export class GatewayModule {}

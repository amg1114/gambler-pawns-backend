import { Module } from "@nestjs/common";
import { WebsocketGateway } from "./websocket.gateway";
import { GameChessManagerService } from "./chess.service";
import { Game as GameEntity } from "./entities/game.entity";
import { GameMode } from "./entities/gameMode.entity";
import { User } from "../user/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        // Importamos las entidades necesarias para el servicio
        TypeOrmModule.forFeature([GameEntity, GameMode, User]),
    ],
    providers: [WebsocketGateway, GameChessManagerService],
})
export class GatewayModule {}

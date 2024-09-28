import { Module } from "@nestjs/common";
import { WebsocketGateway } from "./websocket.gateway";
import { GameChessManagerService } from "./chess.service";
import { Game as GameEntity } from "./entities/game.entity";
import { GameMode } from "./entities/gameMode.entity";
import { User } from "../user/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameWithArcadeModifiers } from "./entities/gameWithArcadeModifiers.entity";
import { ArcadeModifiers } from "./entities/arcadeModifier.entity";
import { ChessController } from "./game/game.controller";
import { GameService } from "./game/game.service";

@Module({
    imports: [
        // Importamos las entidades necesarias para el servicio
        TypeOrmModule.forFeature([
            GameEntity,
            GameMode,
            User,
            GameWithArcadeModifiers,
            ArcadeModifiers,
        ]),
    ],
    providers: [WebsocketGateway, GameChessManagerService, GameService],
    controllers: [ChessController],
})
export class GatewayModule {}

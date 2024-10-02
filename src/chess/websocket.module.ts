import { Module } from "@nestjs/common";
import { WebsocketGateway } from "./websocket.gateway";
import { GameChessManagerService } from "./chess.service";
import { Game as GameEntity } from "./entities/db/game.entity";
import { GameMode } from "./entities/db/gameMode.entity";
import { User } from "../user/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameWithArcadeModifiers } from "./entities/db/gameWithArcadeModifiers.entity";
import { ArcadeModifiers } from "./entities/db/arcadeModifier.entity";
import { HandleGameGateway } from "./handle-game/handle-game.gateway";
import { HandleGameModule } from "./handle-game/handle-game.module";
import { RandomPairingModule } from "./random-pairing/random-pairing.module";

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
        HandleGameModule,
        RandomPairingModule,
    ],
    providers: [WebsocketGateway, GameChessManagerService, HandleGameGateway],
})
export class GatewayModule {}

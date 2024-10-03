import { Module } from "@nestjs/common";
import { ChessGateway } from "./chess.gateway";
import { Game as GameEntity } from "./entities/db/game.entity";
import { GameMode } from "./entities/db/gameMode.entity";
import { User } from "../user/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameWithArcadeModifiers } from "./entities/db/gameWithArcadeModifiers.entity";
import { ArcadeModifiers } from "./entities/db/arcadeModifier.entity";
import { HandleGameGateway } from "./submodules/handle-game/handle-game.gateway";
import { GameLinkController } from "./submodules/game-link/game-link.controller";
import { ActiveGamesService } from "./submodules/active-games/active-games.service";
import { GameLinkService } from "./submodules/game-link/game-link.service";
import { HandleGameService } from "./submodules/handle-game/handle-game.service";
import { RandomPairingGateway } from "./submodules/random-pairing/random-pairing.gateway";
import { RandomPairingService } from "./submodules/random-pairing/random-pairing.service";

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
    providers: [
        ChessGateway,
        ActiveGamesService,
        GameLinkService,
        HandleGameService,
        HandleGameGateway,
        RandomPairingGateway,
        RandomPairingService,
    ],
    controllers: [GameLinkController],
})
export class ChessModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
// entities
import { Game as GameEntity } from "./entities/db/game.entity";
import { ArcadeModifiers } from "./entities/db/arcadeModifier.entity";
import { ChessGateway } from "./chess.gateway";
import { UserAvatarImg } from "src/modules/user/entities/userAvatar.entity";
import { User } from "../user/entities/user.entity";
import { GameWithArcadeModifiers } from "./entities/db/gameWithArcadeModifiers.entity";
// providers
import { HandleGameGateway } from "./submodules/handle-game/handle-game.gateway";
import { ActiveGamesService } from "./submodules/active-games/active-games.service";
import { GameLinkService } from "./submodules/game-link/game-link.service";
import { RandomPairingGateway } from "./submodules/random-pairing/random-pairing.gateway";
import { RandomPairingService } from "./submodules/random-pairing/random-pairing.service";
import { EloService } from "./submodules/handle-game/elo.service";
import { UserService } from "src/modules/user/user.service";
import { GameService } from "./submodules/handle-game/game.service";
import { TimerService } from "./submodules/handle-game/timer.service";
import { DrawGateway } from "./submodules/handle-game/draw.gateway";
import { DrawService } from "./submodules/handle-game/draw.service";
import { TimerGateway } from "./submodules/handle-game/timer.gateway";
import { RewatchGameController } from "./submodules/rewatch/rewatch.controller";
import { PlayersService } from "./submodules/players.service";
import { InactivityService } from "./submodules/handle-game/inactivity.service";
import { GameHistoryService } from "./submodules/game-history/game-history.service";
import { GameHistoryController } from "./submodules/game-history/game-history.controller";
import { GameLinkGateway } from "./submodules/game-link/game-link.gateway";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            GameEntity,
            User,
            UserAvatarImg,
            GameWithArcadeModifiers,
            ArcadeModifiers,
        ]),
    ],
    providers: [
        ChessGateway,
        ActiveGamesService,
        GameLinkService,
        HandleGameGateway,
        RandomPairingGateway,
        RandomPairingService,
        EloService,
        GameService,
        UserService,
        DrawGateway,
        DrawService,
        TimerService,
        TimerGateway,
        PlayersService,
        InactivityService,
        GameHistoryService,
        GameLinkGateway,
    ],
    controllers: [RewatchGameController, GameHistoryController],
    exports: [GameService, PlayersService],
})
export class ChessModule {}

import {
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from "@nestjs/common";
import {
    CreateGameLinkDto,
    GetGameByGameLinkDto,
    JoinGameLinkDto,
} from "./dto/game-link.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Sqids from "sqids";
import { ConfigService } from "@nestjs/config";
import { Game, GameModeType } from "../../entities/db/game.entity";
import {
    PlayerCandidateVerifiedData,
    PlayersService,
} from "../players.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { GameService } from "../handle-game/game.service";

@Injectable()
export class GameLinkService {
    constructor(
        @InjectRepository(Game)
        private gameEntityRepository: Repository<Game>,
        private readonly configService: ConfigService,
        private playersService: PlayersService,
        private gameService: GameService,
    ) {}

    private sqids = new Sqids({
        minLength: 4,
        alphabet: this.configService.getOrThrow<string>("ALPHABET"),
    });

    private gameCache = new Map<
        string,
        {
            createdAt: number;
            playerA: PlayerCandidateVerifiedData;
            gameMode: GameModeType;
            timeIncrementPerMoveSeconds: number;
            timeInMinutes: number;
        }
    >();

    async createGameLink({
        userId,
        gameMode,
        timeInMinutes,
        timeIncrementPerMoveSeconds,
    }: CreateGameLinkDto) {
        const player = await this.playersService.createPlayer(userId, gameMode);

        // Save the game in cache to be able to retrieve it later when player B joins
        const now = Date.now();
        const gameId = this.genGameLinkEncodeByGameId(now);
        this.gameCache.set(gameId, {
            createdAt: now,
            playerA: player,
            gameMode,
            timeIncrementPerMoveSeconds,
            timeInMinutes,
        });
        return gameId;
    }

    async joinGameLink({ gameId, userId }: JoinGameLinkDto) {
        const game = this.gameCache.get(gameId);

        if (!game) throw new NotFoundException("Game not found");

        const playerB = await this.playersService.createPlayer(
            userId,
            game.gameMode,
        );

        this.gameCache.delete(gameId);

        const gameInstance = await this.gameService.createGame(
            game.playerA,
            playerB,
            game.gameMode,
            "Link Shared",
            game.timeInMinutes,
            game.timeIncrementPerMoveSeconds,
        );

        const gameData = {
            gameId: gameInstance.gameId,
            playerWhite: this.playersService.transforPlayerData(
                gameInstance.whitesPlayer,
            ),
            playerBlack: this.playersService.transforPlayerData(
                gameInstance.blacksPlayer,
            ),
            mode: gameInstance.mode,
        };

        return gameData;
    }

    @Cron(CronExpression.EVERY_12_HOURS)
    cleanExpiredGames() {
        const expirationTime = 12 * 60 * 60 * 1000;
        const now = Date.now();

        for (const [id, { createdAt }] of this.gameCache.entries()) {
            if (now - createdAt > expirationTime) {
                this.gameCache.delete(id);
            }
        }
    }

    async getGameByGameLink({ encodedId }: GetGameByGameLinkDto) {
        const decodedId = this.decodeGameLink(encodedId);
        const reEncodedId = this.genGameLinkEncodeByGameId(decodedId);

        if (reEncodedId !== encodedId)
            throw new NotAcceptableException("Invalid ID");

        const game = await this.gameEntityRepository.findOne({
            where: { gameId: decodedId[0] },
            relations: ["whitesPlayer", "blacksPlayer"],
        });

        if (!game) throw new NotFoundException("Game not found");
        return game;
    }

    // generic functions
    genGameLinkEncodeByGameId(gameId: number) {
        return this.sqids.encode([gameId]);
    }

    decodeGameLink(encodedId: string) {
        return this.sqids.decode(encodedId)[0];
    }
}

import {
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from "@nestjs/common";
import { CreateGameLinkDto, GetGameByGameLinkDto } from "./dto/game-link.dto";
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

@Injectable()
export class GameLinkService {
    constructor(
        @InjectRepository(Game)
        private gameEntityRepository: Repository<Game>,
        private readonly configService: ConfigService,
        private playersService: PlayersService,
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
            where: { gameId: decodedId },
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

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
import { ActiveUsersService } from "src/modules/user/active-users/active-users.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class GameLinkService {
    constructor(
        @InjectRepository(Game)
        private gameEntityRepository: Repository<Game>,
        private readonly configService: ConfigService,
        private playersService: PlayersService,
        private activeUsersService: ActiveUsersService,
        private eventEmitter: EventEmitter2,
    ) {}

    private sqids = new Sqids({
        minLength: 4,
        alphabet: this.configService.getOrThrow<string>("ALPHABET"),
    });

    public activeGuestUsers = new Map<string, string>(); // guestId -> socketId
    private mapGameLinkToGameData = new Map<
        string,
        {
            createdAt: number;
            playerA: PlayerCandidateVerifiedData;
            gameMode: GameModeType;
            timeIncrementPerMoveSeconds: number;
            timeInMinutes: number;
        }
    >(); // linkId -> gameData

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
        this.mapGameLinkToGameData.set(gameId, {
            createdAt: now,
            playerA: player,
            gameMode,
            timeIncrementPerMoveSeconds,
            timeInMinutes,
        });
        return gameId;
    }

    async joinGameLink({ gameId, userId }: JoinGameLinkDto) {
        const game = this.mapGameLinkToGameData.get(gameId);

        if (!game) throw new NotFoundException("Game not found");

        const playerB = await this.playersService.createPlayer(
            userId,
            game.gameMode,
        );

        this.mapGameLinkToGameData.delete(gameId);

        const gameInstance = await new Promise<any>((resolve, reject) => {
            this.eventEmitter.emit("game.create", {
                player1: game.playerA,
                player2: playerB,
                mode: game.gameMode,
                typePairing: "Link Shared",
                timeInMinutes: game.timeInMinutes,
                timeIncrementPerMoveSeconds: game.timeIncrementPerMoveSeconds,
                resolve,
                reject,
            });
        });

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

        const socketA = this.activeUsersService.activeUsers.get(
            +game.playerA.userInfo.userId,
        );
        const socketB = this.activeUsersService.activeUsers.get(
            +playerB.userInfo.userId,
        );

        return { gameData, socketA, socketB };
    }

    @Cron(CronExpression.EVERY_12_HOURS)
    cleanExpiredGames() {
        const expirationTime = 12 * 60 * 60 * 1000;
        const now = Date.now();

        for (const [
            id,
            { createdAt },
        ] of this.mapGameLinkToGameData.entries()) {
            if (now - createdAt > expirationTime) {
                this.mapGameLinkToGameData.delete(id);
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

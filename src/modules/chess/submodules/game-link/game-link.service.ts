import {
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from "@nestjs/common";
import { CreateGameLinkDto, GetGameByGameLinkDto } from "./dto/game-link.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game, GameModeType } from "../../entities/db/game.entity";
import {
    PlayerCandidateVerifiedData,
    PlayersService,
} from "../players.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { GameService } from "../handle-game/game.service";
import { WsException } from "@nestjs/websockets";
import { SqidsUtils } from "src/common/utils/sqids.utils";

interface CreateNewGameByLinkData {
    createdAt: number;
    playerA: PlayerCandidateVerifiedData;
    playerASocketId: string;
    gameMode: GameModeType;
    timeIncrementPerMoveSeconds: number;
    timeInMinutes: number;
}

type temporalEncryptedId = string;

@Injectable()
export class GameLinkService {
    constructor(
        @InjectRepository(Game)
        private readonly gameEntityRepository: Repository<Game>,
        private readonly playersService: PlayersService,
        private readonly gameService: GameService,
    ) {}

    /**
     * A map that associates a temporary encrypted ID with the data required to create a new game by link.
     * temporalEncryptedId -> CreateNewGameByLinkData
     */
    private tempGameCreationByLinkMap = new Map<
        temporalEncryptedId,
        CreateNewGameByLinkData
    >();

    /**
     * A map that associates a player ID with the temporary encrypted ID.
     * playerId -> temporalEncryptedId
     */
    private playerIdToGameLinkMap = new Map<string, string>();

    /**
     * Creates a temporary game link for inviting another player.
     */
    async createGameLink(data: CreateGameLinkDto, socketId: string) {
        const {
            playerId,
            gameMode,
            timeInMinutes,
            timeIncrementPerMoveSeconds,
        } = data;

        const playerA = await this.playersService.createPlayer(
            playerId,
            gameMode,
        );

        // Save the game in tempGameCreationByLinkMap to be able to retrieve it later when playerB joins
        const currentTime = Date.now();
        // random postfix to avoid collisions. range [0, 999]
        const randomIdPostfix = Math.floor(Math.random() * 1000);

        const temporalEncryptedId = SqidsUtils.encodeGameId(
            currentTime + randomIdPostfix,
        );
        this.tempGameCreationByLinkMap.set(temporalEncryptedId, {
            createdAt: currentTime,
            playerA,
            playerASocketId: socketId,
            gameMode,
            timeIncrementPerMoveSeconds,
            timeInMinutes,
        });

        this.playerIdToGameLinkMap.set(
            playerId.toString(),
            temporalEncryptedId,
        );

        return temporalEncryptedId;
    }

    checkAndUpdatePlayerSocketId(playerId: string, socketId: string) {
        const temporalEncryptedId = this.playerIdToGameLinkMap.get(playerId);
        if (!temporalEncryptedId) return;

        const gameData =
            this.tempGameCreationByLinkMap.get(temporalEncryptedId);
        if (!gameData) return;

        gameData.playerASocketId = socketId;
    }

    /**
     * Cleans up expired game links from `tempGameCreationByLinkMap`.
     * This method is scheduled to run every 12 hours
     */
    @Cron(CronExpression.EVERY_12_HOURS)
    cleanExpiredGames() {
        const expirationTime = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
        const now = Date.now();

        for (const [id, gameData] of this.tempGameCreationByLinkMap.entries()) {
            if (now - gameData.createdAt > expirationTime) {
                // Remove entry from both maps
                this.playerIdToGameLinkMap.delete(
                    gameData.playerA.userInfo.userId.toString(),
                );
                this.tempGameCreationByLinkMap.delete(id);
            }
        }
    }

    async getGameByGameLink({ encodedId }: GetGameByGameLinkDto) {
        const decodedId = SqidsUtils.decodeGameId(encodedId);
        const reEncodedId = SqidsUtils.encodeGameId(decodedId);

        if (reEncodedId !== encodedId)
            throw new NotAcceptableException("Invalid ID");

        const game = await this.gameEntityRepository.findOne({
            where: { gameId: decodedId },
            relations: ["whitesPlayer", "blacksPlayer"],
        });

        if (!game) throw new NotFoundException("Game not found");
        return game;
    }

    /** method triggered when playerB joins a game by link */
    async startGameByLink(encodedId: string, playerBId: string) {
        const gameData = this.tempGameCreationByLinkMap.get(encodedId);

        if (!gameData) throw new NotFoundException("Game not found");
        // do nothing if playerB is the same as playerA
        if (gameData.playerA.userInfo.userId.toString() === playerBId) return;

        const playerB = await this.playersService.createPlayer(
            playerBId,
            gameData.gameMode,
        );

        try {
            const newGame = await this.gameService.createGame(
                gameData.playerA,
                playerB,
                gameData.gameMode,
                "Link Shared",
                gameData.timeInMinutes,
                gameData.timeIncrementPerMoveSeconds,
            );

            this.tempGameCreationByLinkMap.delete(encodedId);
            this.playerIdToGameLinkMap.delete(
                gameData.playerA.userInfo.userId.toString(),
            );

            return {
                player1Socket: gameData.playerASocketId,
                gameData: newGame.getProperties(),
            };
        } catch (error) {
            throw new WsException("Failed to create game");
        }
    }
}

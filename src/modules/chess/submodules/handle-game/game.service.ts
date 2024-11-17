import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { WsException } from "@nestjs/websockets";

// entities and types
import {
    Game as GameEntity,
    GameModeType,
    GameResultType,
    GameTypePairing,
} from "../../entities/db/game.entity";
import { Game } from "../../entities/game";

// services
import { TimerService } from "./timer.service";
import { GameLinkService } from "../game-link/game-link.service";
import { EloService } from "./elo.service";
import { GameWinner } from "../../entities/db/game.entity";
import { UserService } from "src/modules/user/user.service";
import { ActiveGamesService } from "../active-games/active-games.service";
import { PlayerCandidateVerifiedData } from "../players.service";
import { User } from "src/modules/user/entities/user.entity";
import { InactivityService } from "./inactivity.service";

@Injectable()
/** Handle chess game logic */
export class GameService {
    constructor(
        @InjectRepository(GameEntity)
        private readonly gameRepository: Repository<GameEntity>,
        private readonly timerService: TimerService,
        private readonly gameLinkService: GameLinkService,
        private readonly eloService: EloService,
        private readonly userService: UserService,
        private readonly activeGamesService: ActiveGamesService,
        private readonly inactivityService: InactivityService,
        private eventEmitter: EventEmitter2,
    ) {}

    /**
     * Creates a game based on the provided players, game mode, pairing type, and time settings.
     */
    async createGame(
        player1: PlayerCandidateVerifiedData,
        player2: PlayerCandidateVerifiedData,
        mode: GameModeType,
        typePairing: GameTypePairing,
        timeInMinutes: number,
        timeIncrementPerMoveSeconds: number,
    ): Promise<Game> {
        let gameInstance: Game;

        if (typePairing === "Random Pairing") {
            gameInstance = await this.createGameForRandomPairing(
                player1,
                player2,
                mode,
                timeInMinutes,
                timeIncrementPerMoveSeconds,
            );
        }

        console.log("Game created", gameInstance.gameId);
        return gameInstance;
    }

    /**
     * Creates a game for random pairing, registers it in the active games service, initializes the inactivity tracker,
     * and starts the game timer.
     */
    private async createGameForRandomPairing(
        player1: PlayerCandidateVerifiedData,
        player2: PlayerCandidateVerifiedData,
        mode: GameModeType,
        timeInMinutes: number,
        timeIncrementPerMoveSeconds: number,
    ): Promise<Game> {
        // Create game instance
        const gameInstance = new Game();
        await gameInstance.createGame(
            player1,
            player2,
            mode,
            "Random Pairing",
            timeInMinutes,
            timeIncrementPerMoveSeconds,
        );

        // Save game in db
        const newGameEntity = this.gameRepository.create({
            gameTimestamp: new Date(),
            pgn: gameInstance.board.pgn(),
            whitesPlayer: player1.isGuest ? null : (player1.userInfo as User),
            blacksPlayer: player2.isGuest ? null : (player2.userInfo as User),
            eloWhitesBeforeGame: player1.elo,
            eloBlacksBeforeGame: player2.elo,
            whitesPlayerTime: timeInMinutes,
            blacksPlayerTime: timeInMinutes,
            gameMode: gameInstance.mode,
            typePairing: gameInstance.typePairing,
        });
        const newGame = await this.gameRepository.save(newGameEntity);

        const gameEncryptedId = this.gameLinkService.genGameLinkEncodeByGameId(
            newGame.gameId,
        );

        gameInstance.gameId = gameEncryptedId;

        this.startGame(gameInstance);

        return gameInstance;
    }

    /**
     * Starts a game by registering it in the active games service, initializing the inactivity tracker,
     * and starting the game timer.
     */
    private startGame(gameInstance: Game): void {
        this.activeGamesService.registerActiveGame(gameInstance);

        const blackPlayerId =
            gameInstance.blacksPlayer.userInfo.userId.toString();
        const whitePlayerId =
            gameInstance.whitesPlayer.userInfo.userId.toString();

        this.inactivityService.initializeTracker(
            gameInstance.gameId,
            gameInstance.timeInMinutes,
            whitePlayerId,
            blackPlayerId,
        );

        this.timerService.startTimer(
            gameInstance.gameId,
            gameInstance.timeInMinutes,
            gameInstance.timeIncrementPerMoveSeconds,
        );
    }

    async playerMove(
        playerId: string,
        move: { from: string; to: string; promotion?: string },
        gameInstance: Game,
    ) {
        // make move in game instance
        const moveResult = gameInstance.makeMove(playerId, move);

        if (gameInstance.board.isCheckmate()) {
            const winner = gameInstance.board.turn() === "w" ? "b" : "w";
            await this.endGame(winner, gameInstance, "Check Mate");
        }
        // Check for draw cases
        else if (gameInstance.board.isInsufficientMaterial()) {
            await this.endGame("draw", gameInstance, "Insufficient Material");
        } else if (gameInstance.board.isStalemate()) {
            await this.endGame("draw", gameInstance, "Stalemate");
        } else if (gameInstance.board.isThreefoldRepetition()) {
            await this.endGame("draw", gameInstance, "Threefold Repetition");
        } else if (gameInstance.board.isDraw()) {
            await this.endGame("draw", gameInstance, "50 Moves Rule");
        }
        // update timer
        this.timerService.updateTimer(
            gameInstance.gameId,
            gameInstance.board.turn(),
        );

        // update inactivity tracker
        this.inactivityService.updateActivity(
            gameInstance.gameId,
            gameInstance.board.turn(),
        );
        return {
            moveResult,
        };
    }

    @OnEvent("timer.timeout", { async: true })
    async handleGameTimeout(payload: { gameId: string; winner: "w" | "b" }) {
        console.log(`Time up for game ${payload.gameId}`);

        const gameInstance = this.activeGamesService.findGameByGameId(
            payload.gameId,
        );
        if (!gameInstance) {
            throw new WsException("Game not found for timeout");
        }
        await this.endGame(payload.winner, gameInstance, "On Time");
    }

    @OnEvent("inactivity.timeout", { async: true })
    async handleInactivityTimeout(payload: {
        gameId: string;
        winner: "w" | "b";
    }) {
        const gameInstance = this.activeGamesService.findGameByGameId(
            payload.gameId,
        );
        if (!gameInstance) {
            throw new WsException("Game not found for inactivity timeout");
        }
        await this.endGame(payload.winner, gameInstance, "Abandon");
    }

    async endGame(
        winner: GameWinner,
        gameInstance: Game,
        resultType: GameResultType,
    ): Promise<void> {
        console.log(`Game ${gameInstance.gameId} ended with winner: ${winner}`);

        const whitesPlayerId =
            gameInstance.whitesPlayer.userInfo.userId.toString();
        const blacksPlayerId =
            gameInstance.blacksPlayer.userInfo.userId.toString();

        // get timer data and stop timer
        const timeAfterGameEndWhites = this.timerService.getRemainingTime(
            gameInstance.gameId,
        ).playerOneTime;
        const timeAfterGameEndBlacks = this.timerService.getRemainingTime(
            gameInstance.gameId,
        ).playerTwoTime;

        this.activeGamesService.unRegisterActiveGame(gameInstance);
        this.inactivityService.stopTracking(gameInstance.gameId);
        this.timerService.stopTimer(gameInstance.gameId);

        // calculate new elo for both players
        const eloWhitesAfterGame = this.eloService.calculateNewElo(
            gameInstance.whitesPlayer.elo,
            gameInstance.blacksPlayer.elo,
            winner === "w" ? 1 : winner === "b" ? 0 : 0.5,
        );
        const eloBlacksAfterGame = this.eloService.calculateNewElo(
            gameInstance.blacksPlayer.elo,
            gameInstance.whitesPlayer.elo,
            winner === "b" ? 1 : winner === "w" ? 0 : 0.5,
        );

        await this.userService.updatePlayersStats(
            winner,
            blacksPlayerId,
            whitesPlayerId,
            eloBlacksAfterGame,
            eloWhitesAfterGame,
            gameInstance.mode,
        );

        // update game in
        await this.gameRepository.update(
            this.gameLinkService.decodeGameLink(gameInstance.gameId),
            {
                pgn: gameInstance.board.pgn(),
                winner,
                eloWhitesAfterGame,
                eloBlacksAfterGame,
                resultType,
                timeAfterGameEndWhites,
                timeAfterGameEndBlacks,
            },
        );

        // emit event to notify
        const eloWhitesAfterGameVariation = Math.abs(
            gameInstance.whitesPlayer.elo - eloWhitesAfterGame,
        );
        const eloBlacksAfterGameVariation = Math.abs(
            gameInstance.blacksPlayer.elo - eloBlacksAfterGame,
        );

        const resultData = {
            winner,
            resultType,
            eloWhitesAfterGameVariation:
                winner === "w"
                    ? eloWhitesAfterGameVariation
                    : eloWhitesAfterGameVariation * -1,
            eloBlacksAfterGameVariation:
                winner === "b"
                    ? eloBlacksAfterGameVariation
                    : eloBlacksAfterGameVariation * -1,
            // gameCoinsGift different from bet, is a fixed gift for winning given by the game
            gameGiftForWin: 10,
            // winner : 10, draw: 5, loser: 0
            //gameCoinsGiftIfWin: 10,
            //gameCoinsGiftIfDraw: 5,
            //gameCoinsGiftIfLose: 0,

            // TODO: revisar si se va a implementar apuestas
            //betCoinsWonIfWin: 0,
            //betCoinsWonIfDraw: 0,
        };

        // emit event to trigger notification to users in handle-game.gateway
        this.eventEmitter.emit("game.end", {
            gameId: gameInstance.gameId,
            resultData,
        });
    }

    handleResign(playerId: string) {
        const gameInstance =
            this.activeGamesService.findGameByPlayerId(playerId);
        if (!gameInstance) {
            throw new WsException("Game not found");
        }

        const winner =
            gameInstance.whitesPlayer.userInfo.userId.toString() === playerId
                ? "b"
                : "w";

        this.endGame(winner, gameInstance, "Resign");
    }
}

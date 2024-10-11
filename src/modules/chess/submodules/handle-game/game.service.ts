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
import { User } from "src/modules/user/entities/user.entity";

// services
import { TimerService } from "./timer.service";
import { GameLinkService } from "../game-link/game-link.service";
import { EloService } from "./elo.service";
import { GameWinner } from "../../entities/db/game.entity";
import { UserService } from "src/modules/user/user.service";
import { ActiveGamesService } from "../active-games/active-games.service";

@Injectable()
/** Handle chess game logic */
export class GameService {
    constructor(
        @InjectRepository(GameEntity)
        private readonly gameRepository: Repository<GameEntity>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly timerService: TimerService,
        private readonly gameLinkService: GameLinkService,
        private readonly eloService: EloService,
        private readonly userService: UserService,
        private readonly activeGamesService: ActiveGamesService,
        private eventEmitter: EventEmitter2,
    ) {}

    async createGame(
        player1Id: string,
        player2Id: string,
        mode: GameModeType,
        typePairing: GameTypePairing,
        initialTime: number,
        incrementTime: number,
    ) {
        // Create game instance
        const gameInstance = new Game();
        await gameInstance.createGame(
            player1Id,
            player2Id,
            mode,
            typePairing,
            initialTime,
            incrementTime,
            this.userRepository,
        );

        // Save game in db
        const newGameEntity = this.gameRepository.create({
            gameTimestamp: new Date(),
            pgn: gameInstance.board.pgn(),
            whitesPlayer: gameInstance.whitesPlayer.user,
            blacksPlayer: gameInstance.blacksPlayer.user,
            eloWhitesBeforeGame: gameInstance.whitesPlayer.elo,
            eloBlacksBeforeGame: gameInstance.blacksPlayer.elo,
            gameMode: gameInstance.mode,
            typePairing: gameInstance.typePairing,
        });
        const newGame = await this.gameRepository.save(newGameEntity);

        const gameEncryptedId = this.gameLinkService.genGameLinkEncodeByGameId(
            newGame.gameId,
        );
        gameInstance.gameId = gameEncryptedId;

        // save game in memory (HashMap)
        this.activeGamesService.setActiveGame(player1Id, gameInstance);
        this.activeGamesService.setActiveGame(player2Id, gameInstance);

        // start timer for game
        this.timerService.startTimer(
            gameEncryptedId,
            initialTime,
            incrementTime,
        );

        return {
            ...newGame,
            gameId: gameEncryptedId,
        };
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

        return {
            moveResult,
        };
    }

    @OnEvent("timer.timeout")
    async handleGameTimeout(payload: { gameId: string; winner: "w" | "b" }) {
        console.log(`Time up for game ${payload.gameId}`);

        const gameInstance = this.activeGamesService.findGameByGameId(
            payload.gameId,
        );
        if (!gameInstance) {
            throw new WsException("Game not found");
        }
        await this.endGame(payload.winner, gameInstance, "On Time");
    }

    async endGame(
        winner: GameWinner,
        gameInstance: Game,
        resultType: GameResultType,
    ): Promise<void> {
        console.log(`Game ${gameInstance.gameId} ended with winner: ${winner}`);
        // TODO: eliminar el juego de todos los maps (activeGames, draws, revisar esto)

        // get timer data and stop timer
        const timeAfterGameEndWhites = this.timerService.getRemainingTime(
            gameInstance.gameId,
        ).playerOneTime;
        const timeAfterGameEndBlacks = this.timerService.getRemainingTime(
            gameInstance.gameId,
        ).playerTwoTime;

        this.timerService.stopTimer(gameInstance.gameId);

        // TODO: update players elo in db
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

        // update streaks if players are not guests
        // TODO: how to handle guests?
        if (winner === "b") {
            await this.userService.increaseStreakBy1(
                gameInstance.blacksPlayer.playerId,
            );
            await this.userService.resetStreak(
                gameInstance.whitesPlayer.playerId,
            );
        } else if (winner === "w") {
            await this.userService.increaseStreakBy1(
                gameInstance.whitesPlayer.playerId,
            );
            await this.userService.resetStreak(
                gameInstance.blacksPlayer.playerId,
            );
        }

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
        const eloWhitesAfterGameVariation =
            gameInstance.whitesPlayer.elo - eloWhitesAfterGame;
        const eloBlacksAfterGameVariation =
            gameInstance.blacksPlayer.elo - eloBlacksAfterGame;

        const resultData = {
            winner,
            resultType,
            eloWhitesAfterGameVariation,
            eloBlacksAfterGameVariation,
            // TODO: revisar esto (diferente de la apuesta, es es el dinero que le juego da por default al ganar)
            gameGiftForWin: 10,
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
            gameInstance.whitesPlayer.playerId === playerId ? "b" : "w";

        this.endGame(winner, gameInstance, "Resign");
    }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game as GameEntity } from "../../entities/db/game.entity";
import { TimerService } from "./timer.service";
import { GameLinkService } from "../game-link/game-link.service";
import { EloService } from "./elo.service";
import { GameWinner } from "../../entities/db/game.entity";
import { ActiveGamesService } from "../active-games/active-games.service";

@Injectable()
/** Handle game operations in db */
export class GameService {
    constructor(
        @InjectRepository(GameEntity)
        private readonly gameRepository: Repository<GameEntity>,
        private readonly activeGamesService: ActiveGamesService,
        private readonly timerService: TimerService,
        private readonly gameLinkService: GameLinkService,
        private readonly eloService: EloService, // Incluir EloService
    ) {}

    async createGame(
        gameData: Partial<GameEntity>,
        initialTime: number,
        incrementTime: number,
    ) {
        const newGame = await this.gameRepository.save(
            this.gameRepository.create(gameData),
        );

        const gameEncriptedId = this.gameLinkService.genGameLinkEncodeByGameId(
            newGame.gameId,
        );

        // start timer for the game
        this.timerService.startTimer(
            gameEncriptedId,
            initialTime,
            incrementTime,
        );

        return {
            ...newGame,
            gameId: gameEncriptedId,
        };
    }

    async playerMove(
        gameId: string,
        playerId: string,
        move: { from: string; to: string },
        gameInstance: any, // El juego en memoria
    ): Promise<{
        moveResult: any;
        board: string;
        gameOver?: boolean;
        winner?: string;
    }> {
        // Realizar el movimiento en el estado del juego
        const moveResult = gameInstance.makeMove(playerId, move);

        // Si el juego ha terminado
        if (moveResult.gameOver) {
            await this.endGame(gameId, moveResult.winner, gameInstance);
        }

        return moveResult;
    }

    async endGame(gameId: string, winner: GameWinner): Promise<void> {
        //const game = await this.activeGamesService(gameId);

        const eloWhitesAfterGame = this.eloService.calculateNewElo(
            game.whitesPlayer.elo,
            game.blacksPlayer.elo,
            winner === "w" ? 1 : winner === "b" ? 0 : 0.5,
        );

        const eloBlacksAfterGame = this.eloService.calculateNewElo(
            game.blacksPlayer.elo,
            game.whitesPlayer.elo,
            winner === "b" ? 1 : winner === "w" ? 0 : 0.5,
        );

        // Actualizar streaks
        if (winner === "b") {
            await this.userService.increaseStreakBy1(
                game.blacksPlayer.playerId,
            );
            await this.userService.resetStreak(game.whitesPlayer.playerId);
        } else if (winner === "w") {
            await this.userService.increaseStreakBy1(
                game.whitesPlayer.playerId,
            );
            await this.userService.resetStreak(game.blacksPlayer.playerId);
        }

        // Actualizar el resultado del juego en la base de datos
        await this.updateGameResult(gameId, {
            pgn: game.board.pgn(),
            winner,
            eloWhitesAfterGame,
            eloBlacksAfterGame,
        });
    }
}

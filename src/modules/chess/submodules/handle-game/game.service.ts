import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

// entities and types
import {
    Game as GameEntity,
    GameModeType,
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

        // save game in memory (HashMap)
        this.activeGamesService.setActiveGame(player1Id, gameInstance);
        this.activeGamesService.setActiveGame(player2Id, gameInstance);

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

    async playerMove(playerId: string, move: { from: string; to: string }) {
        const gameInstance =
            this.activeGamesService.findGameByPlayerId(playerId);

        if (!gameInstance) {
            return { error: "Game not found" };
        }

        // make move in game instance
        const moveResult = gameInstance.makeMove(playerId, move);

        if (gameInstance.board.isGameOver()) {
            const winner = gameInstance.board.turn() === "w" ? "b" : "w";
            await this.endGame(winner, gameInstance);
            return { gameOver: true, winner };
        }

        // TODO: update timers
        // const lastPlayer =
        //     playerId === gameInstance.playerOneId ? "playerOne" : "playerTwo";
        // this.timerService.changeTurn(game, lastPlayer, game.increment);

        return { moveResult, gameOver: false };
    }

    async endGame(winner: GameWinner, gameInstance: Game): Promise<void> {
        // TODO: update players elo in db
        // TODO: set streaks
        // TODO: stop timers?
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

        // TODO: set result type
        // update game in db
        await this.gameRepository.update(
            this.gameLinkService.decodeGameLink(gameInstance.gameId),
            {
                pgn: gameInstance.board.pgn(),
                winner: winner,
                eloWhitesAfterGame: eloWhitesAfterGame,
                eloBlacksAfterGame: eloBlacksAfterGame,
            },
        );
    }

    handleResign(playerId: string) {
        const gameInstance =
            this.activeGamesService.findGameByPlayerId(playerId);

        if (!gameInstance) {
            return { error: "Juego no encontrado" };
        }

        const winner =
            gameInstance.whitesPlayer.playerId === playerId ? "b" : "w";
        this.endGame(winner, gameInstance); // Finaliza el juego actualizando el ELO y el estado
        // TODO: ¿debería devolver el estado del juego?
        return { gameInstance, winner };
    }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ActiveGamesService } from "../active-games/active-games.service";
import { GameLinkService } from "../game-link/game-link.service";
// entities
import { User } from "src/modules/user/entities/user.entity";
import { GameModeType } from "../../entities/db/game.entity";

// models
import { Game } from "../../entities/game";
import { UserService } from "src/modules/user/user.service";
import { EloService } from "../handle-game/elo.service";
import { GameService } from "../handle-game/game.service";

export interface Player {
    playerId: string;
    eloRating: number;
    socketId: string;
    initialTime: number;
    incrementTime: number;
}

@Injectable()
export class RandomPairingService {
    private rapidPool: Player[] = [];
    private blitzPool: Player[] = [];
    private bulletPool: Player[] = [];

    constructor(
        private gameLinkService: GameLinkService,
        private userService: UserService,
        private eloService: EloService,
        private gameService: GameService,
        private chessService: ActiveGamesService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async addToPool(player: Player, mode: GameModeType) {
        const pool = this.getPoolByMode(mode);
        pool.push(player);
        return await this.tryToPairPlayers(mode);
    }

    async tryToPairPlayers(mode: GameModeType) {
        const pool = this.getPoolByMode(mode);
        // TODO: agregar logica setTimeOut para esperar a que la pool tenga más jugadores +-5s

        // sort array by elo
        pool.sort((a: Player, b: Player) => a.eloRating - b.eloRating);

        // Filtrar jugadores con el mismo initialTime e incrementTime
        const filteredPool = pool.filter(
            (player: Player, index: number, self: Player[]) =>
                self.findIndex(
                    (p) =>
                        p.initialTime === player.initialTime &&
                        p.incrementTime === player.incrementTime,
                ) === index,
        );

        if (filteredPool.length < 2) return;

        // pairing first two players in filtered array
        const player1 = filteredPool.shift();
        const player2 = filteredPool.shift();

        if (player1 && player2) {
            // Remove paired players from the original pool
            this.removePlayerFromPool(pool, player1);
            this.removePlayerFromPool(pool, player2);

            // creating new game and callign createGameInDB in order to insert data in db
            const newGame = await new Game(
                this.userRepository,
                this.userService,
                this.eloService,
                this.gameService,
                this.gameLinkService,
            ).createGame(
                player1.playerId,
                player2.playerId,
                mode,
                "Random Pairing",
                player1.initialTime,
                player2.incrementTime,
            );

            // save game in memory (HashMap)
            this.chessService.setActiveGame(player1.playerId, newGame);
            this.chessService.setActiveGame(player2.playerId, newGame);
            return {
                gameId: newGame.gameId,
                player1Socket: player1.socketId,
                player2Socket: player2.socketId,
                playerWhite: newGame.whitesPlayer,
                playerBlack: newGame.blacksPlayer,
            };
        }
    }
    getPoolByMode(mode: GameModeType) {
        return this[`${mode}Pool`];
    }

    removePlayerFromPool(pool: Player[], player: Player) {
        const index = pool.indexOf(player);
        if (index > -1) {
            pool.splice(index, 1);
        }
    }
}

import { Injectable } from "@nestjs/common";
// entities
import { GameModeType } from "../../entities/db/game.entity";
// services
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

    constructor(private gameService: GameService) {}

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

            // Create new game
            const newGame = await this.gameService.createGame(
                player1.playerId,
                player2.playerId,
                mode,
                "Random Pairing",
                player1.initialTime,
                player1.incrementTime,
            );

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

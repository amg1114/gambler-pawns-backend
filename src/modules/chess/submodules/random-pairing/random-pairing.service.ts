import { Injectable } from "@nestjs/common";
import { GameModeType } from "../../entities/db/game.entity";
import { GameService } from "../handle-game/game.service";

export interface Player {
    playerId: string;
    eloRating: number;
    socketId: string;
    initialTime: number;
    incrementTime: number;
    joinedAt: number;
}

type TimeKey = string;

@Injectable()
export class RandomPairingService {
    private pools: Record<GameModeType, Map<TimeKey, Player[]>> = {
        rapid: new Map(),
        blitz: new Map(),
        bullet: new Map(),
        arcade: new Map(),
    };

    private readonly MAX_WAIT_TIME = 30000; // 30 seconds
    private readonly INITIAL_ELO_RANGE = 100;
    private readonly ELO_RANGE_INCREMENT = 50;

    constructor(private gameService: GameService) {}

    async addToPool(player: Player, mode: GameModeType) {
        const pool = this.pools[mode];
        const timeKey = this.getTimeKey(player);

        if (!pool.has(timeKey)) {
            pool.set(timeKey, []);
        }
        const timePool = pool.get(timeKey)!;

        player.joinedAt = Date.now();
        timePool.push(player);

        return this.findMatch(mode, timeKey, player);
    }

    private async findMatch(
        mode: GameModeType,
        timeKey: TimeKey,
        player: Player,
    ) {
        const timePool = this.pools[mode].get(timeKey)!;
        const currentTime = Date.now();
        let bestMatch: Player | null = null;
        let bestMatchIndex: number = -1;
        const adjustedEloRange = this.calculateAdjustedEloRange(
            player.joinedAt,
            currentTime,
        );

        for (let i = 0; i < timePool.length; i++) {
            const opponent = timePool[i];
            if (opponent.playerId === player.playerId) continue;

            const eloDifference = Math.abs(
                player.eloRating - opponent.eloRating,
            );

            if (eloDifference <= adjustedEloRange) {
                bestMatch = opponent;
                bestMatchIndex = i;
                break;
            }

            // If no match found within Elo range, pick the closest after MAX_WAIT_TIME
            if (
                !bestMatch &&
                currentTime - opponent.joinedAt >= this.MAX_WAIT_TIME &&
                (bestMatchIndex === -1 ||
                    eloDifference <
                        Math.abs(player.eloRating - bestMatch.eloRating))
            ) {
                bestMatch = opponent;
                bestMatchIndex = i;
            }
        }

        if (bestMatch) {
            this.removeMatchedPlayers(
                timePool,
                bestMatchIndex,
                player.playerId,
            );
            return this.createGame(mode, player, bestMatch);
        }

        return null; // No match found
    }

    private async createGame(
        mode: GameModeType,
        player1: Player,
        player2: Player,
    ) {
        const [initialTime, incrementTime] = this.getTimeKey(player1)
            .split("-")
            .map(Number);

        try {
            const newGame = await this.gameService.createGame(
                player1.playerId,
                player2.playerId,
                mode,
                "Random Pairing",
                initialTime,
                incrementTime,
            );

            return {
                gameId: newGame.gameId,
                player1Socket: player1.socketId,
                player2Socket: player2.socketId,
                playerWhite: newGame.whitesPlayer,
                playerBlack: newGame.blacksPlayer,
                eloDifference: Math.abs(player1.eloRating - player2.eloRating),
            };
        } catch (error) {
            // Handle the error or propagate it
            throw new Error("Failed to create game: " + error.message);
        }
    }

    private getTimeKey(player: Player): TimeKey {
        return `${player.initialTime}-${player.incrementTime}`;
    }

    private calculateAdjustedEloRange(
        joinedAt: number,
        currentTime: number,
    ): number {
        const waitTime = currentTime - joinedAt;
        return (
            this.INITIAL_ELO_RANGE +
            Math.floor(waitTime / 5000) * this.ELO_RANGE_INCREMENT
        );
    }

    private removeMatchedPlayers(
        timePool: Player[],
        indexToRemove: number,
        playerId: string,
    ) {
        timePool.splice(indexToRemove, 1);
        const playerIndex = timePool.findIndex((p) => p.playerId === playerId);
        if (playerIndex !== -1) timePool.splice(playerIndex, 1);
    }
}

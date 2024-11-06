import { Injectable } from "@nestjs/common";
import { GameModeType } from "../../entities/db/game.entity";
import { GameService } from "../handle-game/game.service";
import {
    PlayerCandidateVerifiedData,
    PlayerCandidateVerifiedRequestData,
    PlayersService,
} from "../players.service";

export interface PlayerCandidateToBeMatchedData
    extends PlayerCandidateVerifiedRequestData {
    userData: PlayerCandidateVerifiedData;
}

type TimeKey = string;

@Injectable()
export class RandomPairingService {
    private pools: Record<
        GameModeType,
        Map<TimeKey, PlayerCandidateToBeMatchedData[]>
    > = {
        rapid: new Map(),
        blitz: new Map(),
        bullet: new Map(),
        arcade: new Map(),
    };

    private readonly MAX_WAIT_TIME = 30000; // 30 seconds
    private readonly INITIAL_ELO_RANGE = 100;
    private readonly ELO_RANGE_INCREMENT = 50;

    constructor(
        private gameService: GameService,
        private playersService: PlayersService,
    ) {}

    async addToPool(
        player: PlayerCandidateToBeMatchedData,
        mode: GameModeType,
    ) {
        const playerVerified = await this.playersService.createPlayer(
            player,
            mode,
        );
        const playerCandidateToBeMatched = {
            ...player,
            userData: playerVerified,
        };

        const pool = this.pools[mode];
        const timeKey = this.getTimeKey(playerCandidateToBeMatched);

        if (!pool.has(timeKey)) {
            pool.set(timeKey, []);
        }
        const timePool = pool.get(timeKey)!;

        playerCandidateToBeMatched.joinedAt = Date.now();
        timePool.push(playerCandidateToBeMatched);

        return this.findMatch(mode, timeKey, playerCandidateToBeMatched);
    }

    private async findMatch(
        mode: GameModeType,
        timeKey: TimeKey,
        player: PlayerCandidateToBeMatchedData,
    ) {
        const timePool = this.pools[mode].get(timeKey)!;
        const currentTime = Date.now();
        let bestMatch: PlayerCandidateToBeMatchedData | null = null;
        let bestMatchIndex: number = -1;
        const adjustedEloRange = this.calculateAdjustedEloRange(
            player.joinedAt,
            currentTime,
        );

        for (let i = 0; i < timePool.length; i++) {
            const opponent = timePool[i];
            if (opponent.playerId === player.playerId) continue;

            const eloDifference = Math.abs(
                player.userData.elo - opponent.userData.elo,
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
                        Math.abs(player.userData.elo - bestMatch.userData.elo))
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
        player1: PlayerCandidateToBeMatchedData,
        player2: PlayerCandidateToBeMatchedData,
    ) {
        const [initialTime, incrementTime] = this.getTimeKey(player1)
            .split("-")
            .map(Number);

        try {
            const newGame = await this.gameService.createGame(
                player1.userData,
                player2.userData,
                mode,
                "Random Pairing",
                initialTime,
                incrementTime,
            );

            // TODO: revisar que solo devuelva los datos necesarios
            return {
                player1Socket: player1.socketId,
                player2Socket: player2.socketId,
                gameId: newGame.gameId,
                playerWhite: newGame.whitesPlayer,
                playerBlack: newGame.blacksPlayer,
                eloDifference: Math.abs(
                    player1.userData.elo - player2.userData.elo,
                ),
            };
        } catch (error) {
            console.error(error);
            throw new Error("Failed to create game");
        }
    }

    private getTimeKey(player: PlayerCandidateToBeMatchedData): TimeKey {
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
        timePool: PlayerCandidateToBeMatchedData[],
        indexToRemove: number,
        playerId: string,
    ) {
        timePool.splice(indexToRemove, 1);
        const playerIndex = timePool.findIndex((p) => p.playerId === playerId);
        if (playerIndex !== -1) timePool.splice(playerIndex, 1);
    }
}

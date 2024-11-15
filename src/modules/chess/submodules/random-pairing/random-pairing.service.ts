import { Injectable } from "@nestjs/common";
import { GameModeType } from "../../entities/db/game.entity";
import { GameService } from "../handle-game/game.service";
import {
    PlayerCandidateVerifiedData,
    PlayerCandidateVerifiedRequestData,
    PlayersService,
} from "../players.service";
import { WsException } from "@nestjs/websockets";
import { ActiveGamesService } from "../active-games/active-games.service";

export interface PlayerCandidateToBeMatchedData
    extends PlayerCandidateVerifiedRequestData {
    userData: PlayerCandidateVerifiedData;
}

type TimeKey = string;

/**
 * Service responsible for managing the random pairing of players for different game modes.
 * It handles adding players to matching pools, finding suitable matches based on ELO and wait time,
 * and creating new games with matched players.
 */
@Injectable()
export class RandomPairingService {
    /**
     * A record of player pools categorized by game mode.
     * Each game mode has a map where the key is a time key (combination of time in minutes and increment per move)
     * and the value is an array of players waiting to be matched.
     *
     * @type {Record<GameModeType, Map<TimeKey, PlayerCandidateToBeMatchedData[]>>}
     * @property {Map<TimeKey, PlayerCandidateToBeMatchedData[]>} rapid - Pool for rapid games.
     * @property {Map<TimeKey, PlayerCandidateToBeMatchedData[]>} blitz - Pool for blitz games.
     * @property {Map<TimeKey, PlayerCandidateToBeMatchedData[]>} bullet - Pool for bullet games.
     * @property {Map<TimeKey, PlayerCandidateToBeMatchedData[]>} arcade - Pool for arcade games.
     */
    private pools: Record<
        GameModeType,
        Map<TimeKey, PlayerCandidateToBeMatchedData[]>
    > = {
        rapid: new Map(),
        blitz: new Map(),
        bullet: new Map(),
        arcade: new Map(),
    };

    constructor(
        private gameService: GameService,
        private playersService: PlayersService,
        private activeGamesService: ActiveGamesService,
    ) {}

    /**
     * Adds a player to the matching pool and attempts to find a match.
     *
     * @param {PlayerCandidateToBeMatchedData} player - The player to be added to the pool.
     * @param {GameModeType} mode - The game mode (rapid, blitz, bullet, arcade).
     * @returns {Promise<any>} The match result or null if no match is found.
     * @throws {WsException} If the player already has an active game.
     */
    async addToPool(
        player: PlayerCandidateToBeMatchedData,
        mode: GameModeType,
    ): Promise<any> {
        // verify player has not active games
        const hasActiveGame = this.activeGamesService.findGameByPlayerId(
            player.playerId,
        );
        if (hasActiveGame) {
            throw new WsException("Player already has an active game");
        }

        // verify player
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

        timePool.push(playerCandidateToBeMatched);

        return this.findMatch(mode, timeKey, playerCandidateToBeMatched);
    }

    /**
     * Finds a match for the given player in the specified game mode and time pool.
     *
     * @param {GameModeType} mode - The game mode (rapid, blitz, bullet, arcade).
     * @param {TimeKey} timeKey - The time key representing the game time settings.
     * @param {PlayerCandidateToBeMatchedData} player - The player to find a match for.
     * @returns {Promise<any>} The match result or null if no match is found.
     */
    private async findMatch(
        mode: GameModeType,
        timeKey: TimeKey,
        player: PlayerCandidateToBeMatchedData,
    ): Promise<any> {
        const timePool = this.pools[mode].get(timeKey)!;

        // time pool sorted by ELO
        timePool.sort((a, b) => a.userData.elo - b.userData.elo);

        if (timePool.length >= 2) {
            const player1 = timePool.shift()!;
            const player2 = timePool.shift()!;

            // Remove matched players from the pools
            // TODO: search if the are better ways to do this: data structures and algos for deletion and matching
            console.log("Match found", player1.userData, player2.userData);
            this.removeMatchedPlayers(mode, timeKey, player1, player2);

            return this.createGame(mode, player1, player2);
        }

        console.log(`No match found for ${player.playerId}`);
        return null; // No match found
    }

    /**
     * Creates a new game with the matched players.
     *
     * @param {GameModeType} mode - The game mode (rapid, blitz, bullet, arcade).
     * @param {PlayerCandidateToBeMatchedData} player1 - The first player.
     * @param {PlayerCandidateToBeMatchedData} player2 - The second player.
     * @returns {Promise<any>} The game creation result.
     * @throws {WsException} If the game creation fails.
     */
    private async createGame(
        mode: GameModeType,
        player1: PlayerCandidateToBeMatchedData,
        player2: PlayerCandidateToBeMatchedData,
    ): Promise<any> {
        const [timeInMinutes, timeIncrementPerMoveSeconds] = this.getTimeKey(
            player1,
        )
            .split("-")
            .map(Number);

        try {
            const newGame = await this.gameService.createGame(
                player1.userData,
                player2.userData,
                mode,
                "Random Pairing",
                timeInMinutes,
                timeIncrementPerMoveSeconds,
            );

            return {
                player1Socket: player1.socketId,
                player2Socket: player2.socketId,
                gameId: newGame.gameId,
                playerWhite: this.playersService.transforPlayerData(
                    newGame.whitesPlayer,
                ),
                playerBlack: this.playersService.transforPlayerData(
                    newGame.blacksPlayer,
                ),
                eloDifference: Math.abs(
                    player1.userData.elo - player2.userData.elo,
                ),
                mode: newGame.mode,
            };
        } catch (error) {
            throw new WsException("Failed to create game");
        }
    }

    /**
     * Generates a time key based on the player's time settings.
     *
     * @param {PlayerCandidateToBeMatchedData} player - The player.
     * @returns {TimeKey} The generated time key.
     */
    private getTimeKey(player: PlayerCandidateToBeMatchedData): TimeKey {
        return `${player.timeInMinutes}-${player.timeIncrementPerMoveSeconds}`;
    }

    /**
     * Removes matched players from the time pool and the pool by mode.
     *
     * @param {GameModeType} mode - The game mode (rapid, blitz, bullet, arcade).
     * @param {TimeKey} timeKey - The time key representing the game time settings.
     * @param {PlayerCandidateToBeMatchedData} player1 - The first matched player.
     * @param {PlayerCandidateToBeMatchedData} player2 - The second matched player.
     */
    private removeMatchedPlayers(
        mode: GameModeType,
        timeKey: TimeKey,
        player1: PlayerCandidateToBeMatchedData,
        player2: PlayerCandidateToBeMatchedData,
    ) {
        const timePool = this.pools[mode].get(timeKey)!;

        // Remove players from the time pool
        this.removePlayerFromPool(timePool, player1);
        this.removePlayerFromPool(timePool, player2);

        // If the time pool is empty, remove the time key from the pool by mode
        if (timePool.length === 0) {
            this.pools[mode].delete(timeKey);
        }
    }

    /**
     * Removes a player from the specified pool.
     *
     * @param {PlayerCandidateToBeMatchedData[]} pool - The pool from which to remove the player.
     * @param {PlayerCandidateToBeMatchedData} player - The player to remove.
     */
    private removePlayerFromPool(
        pool: PlayerCandidateToBeMatchedData[],
        player: PlayerCandidateToBeMatchedData,
    ) {
        const index = pool.findIndex((p) => p.playerId === player.playerId);
        if (index !== -1) {
            pool.splice(index, 1);
        }
    }
}

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
import { OnEvent } from "@nestjs/event-emitter";

export interface PlayerCandidateToBeMatchedData
    extends PlayerCandidateVerifiedRequestData {
    userData: PlayerCandidateVerifiedData;
}

type socketId = string;
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

    /**
     * A map to store the association between player socket IDs and the game mode and time key they are waiting for.
     * This is used to quickly find the player's pool and time key when they want to abort the join to random pairing.
     */
    private socketIdToModaAndTimekeyMap: Map<
        socketId,
        { mode: GameModeType; timeKey: TimeKey }
    > = new Map();

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

        this.socketIdToModaAndTimekeyMap.set(player.socketId, {
            mode,
            timeKey,
        });

        return this.findMatch(mode, timeKey);
    }

    /**
     * Finds a match for the given player in the specified game mode and time pool.
     *
     * @param {GameModeType} mode - The game mode (rapid, blitz, bullet, arcade).
     * @param {TimeKey} timeKey - The time key representing the game time settings.
     * @returns {Promise<any>} The match result or null if no match is found.
     */
    private async findMatch(
        mode: GameModeType,
        timeKey: TimeKey,
        // player: PlayerCandidateToBeMatchedData,
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

            console.log(
                `Game created between ${player1.userData} and ${player2.userData}`,
            );

            return {
                player1Socket: player1.socketId,
                player2Socket: player2.socketId,
                gameId: newGame.gameId,
                timeInMinutes,
                timeIncrementPerMoveSeconds,
                playerWhite: this.playersService.transforPlayerData(
                    newGame.whitesPlayer,
                ),
                playerBlack: this.playersService.transforPlayerData(
                    newGame.blacksPlayer,
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

        this.socketIdToModaAndTimekeyMap.delete(player1.socketId);
        this.socketIdToModaAndTimekeyMap.delete(player2.socketId);
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

    /**
     * Handles the abort join to random pairing request.
     * Removes the player with the given socket ID from the pool and the time pool.
     */
    @OnEvent("game.checkIfRandomPairingIsAborted")
    handleAbortJoinToRandomPairing(payload: { socketId: string }) {
        const { socketId } = payload;

        // verify if socket is in proces of random pairing, cancel if player not found
        const playerInfo = this.socketIdToModaAndTimekeyMap.get(socketId);
        if (!playerInfo) {
            return;
        }

        const { mode, timeKey } = playerInfo;
        const timePool = this.pools[mode].get(timeKey)!;

        const playerIndex = timePool.findIndex(
            (player) => player.socketId === socketId,
        );
        if (playerIndex !== -1) {
            timePool.splice(playerIndex, 1);
            if (timePool.length === 0) {
                this.pools[mode].delete(timeKey);
            }
        }
        this.socketIdToModaAndTimekeyMap.delete(socketId);
    }
}

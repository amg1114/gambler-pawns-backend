import { Injectable } from "@nestjs/common";
import { Game } from "src/modules/chess/entities/game";

type playerId = string;
type gameId = string;

@Injectable()
/**
 * Service to manage active games for players.
 */
export class ActiveGamesService {
    /**
     * Map to store the association between player IDs and game IDs.
     * @private
     */
    private playerIdToGameIdMap: Map<playerId, gameId> = new Map();

    /**
     * Map to store the association between game IDs and game instances.
     * @private
     */
    private gameIdToGameInstanceMap: Map<gameId, Game> = new Map();

    /**
     * Registers an active game for a player.
     * Used when a game is created.
     * @param game - The game instance to be registered.
     */
    registerActiveGame(game: Game): void {
        const whitesPlayerId = game.whitesPlayer.userInfo.userId.toString();
        const blacksPlayerId = game.blacksPlayer.userInfo.userId.toString();

        this.playerIdToGameIdMap.set(whitesPlayerId, game.gameId);
        this.playerIdToGameIdMap.set(blacksPlayerId, game.gameId);
        this.gameIdToGameInstanceMap.set(game.gameId, game);
    }

    /**
     * Unregisters an active game by removing the game instance and associated player IDs from the respective maps.
     * Used when a game ends or is abandoned.
     * @param game - The game instance to be unregistered.
     */
    unRegisterActiveGame(game: Game): void {
        const whitesPlayerId = game.whitesPlayer.userInfo.userId.toString();
        const blacksPlayerId = game.blacksPlayer.userInfo.userId.toString();

        this.playerIdToGameIdMap.delete(whitesPlayerId);
        this.playerIdToGameIdMap.delete(blacksPlayerId);
        this.gameIdToGameInstanceMap.delete(game.gameId);
    }

    /**
     * Finds a game instance by player ID.
     * @param playerId - The ID of the player.
     * @returns The game instance associated with the player ID, or undefined if not found.
     */
    findGameByPlayerId(playerId: playerId): Game | undefined {
        const gameId = this.playerIdToGameIdMap.get(playerId);
        return this.findGameByGameId(gameId);
    }

    /**
     * Finds a game instance by game ID.
     * @param gameId - The ID of the game.
     * @returns The game instance associated with the game ID, or undefined if not found.
     */
    findGameByGameId(gameId: gameId): Game | undefined {
        return this.gameIdToGameInstanceMap.get(gameId);
    }
}

// old methods (sockets)
//private playerSocketMap: Map<socketId, playerId> = new Map();
// (antes usados, ya no son necesarios con las pools de socket.io)
// -> getSocketIdByPlayerId(playerId: string): string | undefined {
// -> registerPlayerSocket(playerId: string, socketId: string) {
// -> unRegisterPlayerSocket(playerId: string)
// -> findPlayerIdBySocketId(socketId: string): string | undefined {

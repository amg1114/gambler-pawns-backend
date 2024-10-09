import { Injectable } from "@nestjs/common";
import { Game } from "src/modules/chess/entities/game";

@Injectable()
export class ActiveGamesService {
    // TODO: jsDocs comments
    // TODO: validar que no exista un juego activo para un playerId, antes de asignar un nuevo juego
    // en tal caso lanzar una excepción
    private activeGames: Map<string, Game> = new Map(); // playerId -> game
    private playerSocketMap: Map<string, string> = new Map(); // playerId -> socketId

    findGameByPlayerId(playerId: string): Game | undefined {
        return this.activeGames.get(playerId);
    }

    getSocketIdByPlayerId(playerId: string): string | undefined {
        return this.playerSocketMap.get(playerId);
    }

    setActiveGame(playerId: string, game: Game) {
        this.activeGames.set(playerId, game);
    }

    findGameByGameId(gameId: string): Game | undefined {
        for (const game of this.activeGames.values()) {
            if (game.gameId === gameId) return game;
        }
    }

    // sockets
    registerPlayerSocket(playerId: string, socketId: string) {
        this.playerSocketMap.set(playerId, socketId);
    }

    unRegisterPlayerSocket(playerId: string) {
        this.playerSocketMap.delete(playerId);
    }

    findPlayerIdBySocketId(socketId: string): string | undefined {
        for (const [playerId, socket] of this.playerSocketMap) {
            if (socket === socketId) return playerId;
        }
    }
}

import { Game } from "./entities/game";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ChessService {
    // TODO: jsDocs comments
    private activeGames: Map<string, Game> = new Map(); // playerId -> game
    private playerSocketMap: Map<string, string> = new Map(); // playerId -> socketId
    sqids: any;

    findGameByPlayerId(playerId: string): Game | undefined {
        return this.activeGames.get(playerId);
    }

    getSocketIdByPlayerId(playerId: string): string | undefined {
        return this.playerSocketMap.get(playerId);
    }

    setActiveGame(playerId: string, game: Game) {
        this.activeGames.set(playerId, game);
    }

    registerPlayerSocket(playerId: string, socketId: string) {
        this.playerSocketMap.set(playerId, socketId);
    }

    // game link
    async genGameLinkByGameId(gameId: number) {
        return this.sqids.encode([gameId]);
    }
}

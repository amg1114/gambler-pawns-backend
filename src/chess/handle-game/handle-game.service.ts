import { Injectable } from "@nestjs/common";
import { Game } from "../game";

@Injectable()
export class HandleGameService {
    private activeGames: Map<string, Game> = new Map(); // playerId -> game
    private playerSocketMap: Map<string, string> = new Map(); // playerId -> socketId

    async handleMove(playerId: string, move: { from: string; to: string }) {
        const game = this.findGameByPlayerId(playerId);

        if (game) {
            return await game.makeMove(playerId, move);
        }
        // TODO: aquí iria una WsException ?
        return { error: "Juego no encontrado" };
    }

    handleResign(playerId: string) {
        const game = this.findGameByPlayerId(playerId);

        if (!game) {
            return { error: "Juego no encontrado" };
        }

        const winner =
            game.whitesPlayer.playerId === playerId ? "Black" : "White";
        game.endGame(winner); // Finaliza el juego actualizando el ELO y el estado
        return { game, winner };
    }

    findGameByPlayerId(playerId: string): Game | undefined {
        return this.activeGames.get(playerId);
    }

    getSocketIdByPlayerId(playerId: string): string | undefined {
        return this.playerSocketMap.get(playerId);
    }
}

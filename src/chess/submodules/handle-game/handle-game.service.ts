import { Injectable } from "@nestjs/common";
import { ActiveGamesService } from "../active-games/active-games.service";

@Injectable()
export class HandleGameService {
    constructor(private readonly activeGamesService: ActiveGamesService) {}

    async handleMove(playerId: string, move: { from: string; to: string }) {
        const game = this.activeGamesService.findGameByPlayerId(playerId);

        if (game) {
            return await game.makeMove(playerId, move);
        }
        // TODO: aquí iria una WsException ?
        return { error: "Juego no encontrado" };
    }

    handleResign(playerId: string) {
        const game = this.activeGamesService.findGameByPlayerId(playerId);

        if (!game) {
            return { error: "Juego no encontrado" };
        }

        const winner =
            game.whitesPlayer.playerId === playerId ? "Black" : "White";
        game.endGame(winner); // Finaliza el juego actualizando el ELO y el estado
        return { game, winner };
    }
}

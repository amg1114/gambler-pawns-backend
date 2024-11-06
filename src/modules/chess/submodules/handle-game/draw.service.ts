import { Injectable } from "@nestjs/common";
import { GameService } from "./game.service";
import { ActiveGamesService } from "../active-games/active-games.service";
import { WsException } from "@nestjs/websockets";
import { Game } from "../../entities/game";

@Injectable()
export class DrawService {
    private drawOffers: Map<string, string> = new Map(); // key: gameId -> playerId (who draw offer)

    constructor(
        private readonly gameService: GameService,
        private readonly activeGamesService: ActiveGamesService,
    ) {}

    offerDraw(gameId: string, playerId: string): string | null {
        // check if draw offer already exists
        if (!this.drawOffers.has(gameId)) {
            this.drawOffers.set(gameId, playerId);
            return playerId; // return the id of the player who made the offer
        }
        return null; // draw offer already exists
    }

    async acceptDraw(gameId: string, playerId: string): Promise<boolean> {
        const game = this.activeGamesService.findGameByPlayerId(playerId);

        if (!game) throw new WsException("Game not found");

        if (this.drawOffers.has(gameId)) {
            this.drawOffers.delete(gameId);

            await this.gameService.endGame("draw", game, "Draw Offer"); // end game with draw
            return true;
        }
        throw new WsException("No draw offer to accpet exists");
    }

    rejectDraw(gameId: string): boolean {
        if (this.drawOffers.has(gameId)) {
            this.drawOffers.delete(gameId);
            return true;
        }
        throw new WsException("No draw offer to reject exists");
    }

    getOpponentId(playerId: string, game: Game): string {
        return playerId === game.whitesPlayer.userInfo.userId.toString()
            ? game.blacksPlayer.userInfo.userId.toString()
            : game.whitesPlayer.userInfo.userId.toString();
    }
}

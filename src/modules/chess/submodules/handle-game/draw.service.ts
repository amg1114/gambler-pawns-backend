import { Injectable } from "@nestjs/common";
import { GameService } from "./game.service";

@Injectable()
export class DrawService {
    private drawOffers: Map<string, string> = new Map(); // key: gameId, value: playerId (draw offer)

    constructor(private readonly gameService: GameService) {}

    offerDraw(gameId: string, playerId: string): string | null {
        // check if draw offer already exists
        if (!this.drawOffers.has(gameId)) {
            this.drawOffers.set(gameId, playerId);
            return playerId; // return the id of the player who made the offer
        }
        return null; // draw offer already exists
    }

    acceptDraw(gameId: string): boolean {
        if (this.drawOffers.has(gameId)) {
            this.drawOffers.delete(gameId);
            // TODO: fix this
            //this.gameService.endGame(gameId, "draw"); // end game with draw
            return true;
        }
        return false;
    }

    rejectDraw(gameId: string): boolean {
        if (this.drawOffers.has(gameId)) {
            this.drawOffers.delete(gameId);
            return true;
        }
        return false;
    }

    getOpponentId(playerId: string, game: any): string {
        return playerId === game.whitesPlayer.playerId
            ? game.blacksPlayer.playerId
            : game.whitesPlayer.playerId;
    }
}

import { Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class TimerService {
    private timers: Map<
        string,
        {
            playerOneTime: number;
            playerTwoTime: number;
            increment: number;
            activePlayer: "playerOne" | "playerTwo";
        }
    > = new Map();

    startTimer(gameId: string, initialTime: number, increment: number): void {
        this.timers.set(gameId, {
            playerOneTime: initialTime,
            playerTwoTime: initialTime,
            increment: increment,
            activePlayer: "playerOne", // Player one starts
        });
    }

    updateTimer(gameId: string, playerId: string, timeSpent: number): void {
        const timer = this.timers.get(gameId);

        if (!timer) {
            throw new WsException(`No timer found for gameId: ${gameId}`);
        }

        if (timer.activePlayer === "playerOne") {
            timer.playerOneTime -= timeSpent;
            timer.playerOneTime += timer.increment;
            timer.activePlayer = "playerTwo"; // Change turn to player 2
        } else {
            timer.playerTwoTime -= timeSpent;
            timer.playerTwoTime += timer.increment;
            timer.activePlayer = "playerOne"; // Change turn to player 1
        }
        this.timers.set(gameId, timer);
    }

    getTime(gameId: string): { playerOneTime: number; playerTwoTime: number } {
        const timer = this.timers.get(gameId);

        if (!timer) {
            throw new Error(`No timer found for gameId: ${gameId}`);
        }

        return {
            playerOneTime: timer.playerOneTime,
            playerTwoTime: timer.playerTwoTime,
        };
    }

    /** Delete timer from map when game ends */
    stopTimer(gameId: string): void {
        this.timers.delete(gameId);
    }
}

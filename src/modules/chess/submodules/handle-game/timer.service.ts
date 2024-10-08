// TODO: agregar columnas de tiempo para cada jugador en la tabla game
// TODO: investigar si es mejor usar redis
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Interval } from "@nestjs/schedule";

@Injectable()
export class TimerService {
    constructor(private eventEmitter: EventEmitter2) {}

    /**  Map to keep track of timers for each game,  gameId -> data */
    private timers: Map<
        string,
        {
            playerOneTime: number;
            playerTwoTime: number;
            increment: number;
            activePlayer: "playerOne" | "playerTwo";
            lastUpdateTime: number;
        }
    > = new Map();

    startTimer(gameId: string, initialTime: number, increment: number): void {
        this.timers.set(gameId, {
            playerOneTime: initialTime,
            playerTwoTime: initialTime,
            increment: increment,
            activePlayer: "playerOne", // Assuming white starts
            lastUpdateTime: Date.now(),
        });

        this.emitTimerUpdate(gameId);
    }

    updateTimer(gameId: string, activePlayer: "playerOne" | "playerTwo"): void {
        const timerData = this.timers.get(gameId);
        // TODO: revisar cual sería el manejo correcto de las excepciones
        if (!timerData) return;

        const now = Date.now();
        const elapsedTime = now - timerData.lastUpdateTime;

        // Decrease time for the player who just moved
        if (timerData.activePlayer === "playerOne") {
            timerData.playerOneTime -= elapsedTime;
        } else {
            timerData.playerTwoTime -= elapsedTime;
        }

        // Add increment to the player who just moved
        if (timerData.activePlayer === "playerOne") {
            timerData.playerOneTime += timerData.increment * 1000;
        } else {
            timerData.playerTwoTime += timerData.increment * 1000;
        }

        // Update active player and last update time
        timerData.activePlayer = activePlayer;
        timerData.lastUpdateTime = now;

        this.timers.set(gameId, timerData);

        // emit event to trigger methos in TimerGateway
        this.emitTimerUpdate(gameId);
    }

    stopTimer(gameId: string): void {
        this.timers.delete(gameId);
    }

    getRemainingTime(
        gameId: string,
    ): { playerOneTime: number; playerTwoTime: number } | null {
        const timerData = this.timers.get(gameId);
        // TODO: como manejar las excepciones?
        if (!timerData) return null;

        const now = Date.now();
        const elapsedTime = now - timerData.lastUpdateTime;

        let playerOneTime = timerData.playerOneTime;
        let playerTwoTime = timerData.playerTwoTime;

        if (timerData.activePlayer === "playerOne") {
            playerOneTime -= elapsedTime;
        } else {
            playerTwoTime -= elapsedTime;
        }

        return {
            playerOneTime: Math.max(0, playerOneTime),
            playerTwoTime: Math.max(0, playerTwoTime),
        };
    }

    @Interval(1000) // Run every second
    handleTimerUpdates() {
        for (const gameId of this.timers.keys()) {
            const remainingTime = this.getRemainingTime(gameId);
            if (!remainingTime) continue;

            if (
                remainingTime.playerOneTime <= 0 ||
                remainingTime.playerTwoTime <= 0
            ) {
                // Time's up for one of the players
                const winner =
                    remainingTime.playerOneTime <= 0
                        ? "playerTwo"
                        : "playerOne";
                this.handleTimeOut(gameId, winner);
            } else {
                this.emitTimerUpdate(gameId);
            }
        }
    }

    private handleTimeOut(gameId: string, winner: "playerOne" | "playerTwo") {
        console.log(`Game ${gameId} ended. Winner by timeout: ${winner}`);

        // TODO: esuchar este evento desde game.service y terminar el juego
        // trigger events in game.service and timer.gateway
        this.eventEmitter.emit("timer.timeout", { gameId, winner });
    }

    /** Emmit to trigger method in TimerGateway */
    private emitTimerUpdate(gameId: string): void {
        const timerData = this.getRemainingTime(gameId);
        if (timerData) {
            this.eventEmitter.emit("timer.updated", {
                gameId,
                playerOneTime: timerData.playerOneTime,
                playerTwoTime: timerData.playerTwoTime,
            });
        }
    }
}

import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Interval } from "@nestjs/schedule";

type ActivePlayer = "w" | "b";
type GameId = string;

interface InactivityData {
    lastMoveTimestamp: number;
    totalGameTime: number;
    inactivityCountdown: number;
    isCountingDown: boolean;
    activePlayer: ActivePlayer;
    whitePlayerId: string;
    blackPlayerId: string;
}

/**
 * Service to handle inactivity in a chess game.
 * It tracks the inactivity of players and emits events when certain thresholds are reached.
 */
@Injectable()
export class InactivityService {
    private static readonly INACTIVITY_THRESHOLD = 0.2; // 20% game duration
    private static readonly COUNTDOWN_DURATION = 30000; // 30 seconds in miliseconds
    private static readonly UPDATE_INTERVAL = 1000; // 1 second in miliseconds

    private inactivityTrackers: Map<GameId, InactivityData> = new Map();

    constructor(private eventEmitter: EventEmitter2) {}

    /**
     * Initializes an inactivity tracker for a given game.
     *
     * @param gameId - The unique identifier of the game.
     * @param initialTimeInMinutes - The initial time of the game in minutes.
     * @param whitePlayerId - The unique identifier of the white player.
     * @param blackPlayerId - The unique identifier of the black player.
     */
    initializeTracker(
        gameId: string,
        initialTimeInMinutes: number,
        whitePlayerId: string,
        blackPlayerId: string,
    ): void {
        const totalGameTime = initialTimeInMinutes * 60 * 1000; // initialTime in minutes to miliseconds

        this.inactivityTrackers.set(gameId, {
            lastMoveTimestamp: Date.now(),
            totalGameTime,
            inactivityCountdown: InactivityService.COUNTDOWN_DURATION,
            isCountingDown: false,
            activePlayer: "w",
            whitePlayerId: whitePlayerId,
            blackPlayerId: blackPlayerId,
        });
    }

    /**
     * Updates the activity of a player in a given game.
     *
     * @param gameId - The unique identifier of the game.
     * @param activePlayer - The player who made the move ("w" for white, "b" for black).
     */
    updateActivity(gameId: string, activePlayer: ActivePlayer): void {
        const tracker = this.inactivityTrackers.get(gameId);
        if (!tracker) return;

        tracker.lastMoveTimestamp = Date.now();
        tracker.activePlayer = activePlayer;
        tracker.isCountingDown = false;
        tracker.inactivityCountdown = InactivityService.COUNTDOWN_DURATION;

        this.inactivityTrackers.set(gameId, tracker);
    }

    /**
     * Stops tracking inactivity for a given game.
     *
     * @param gameId - The unique identifier of the game.
     */
    stopTracking(gameId: string): void {
        this.inactivityTrackers.delete(gameId);
    }

    /**
     * Checks for inactivity in all tracked games and emits events if thresholds are reached.
     * This method is executed at regular intervals.
     */
    @Interval(InactivityService.UPDATE_INTERVAL)
    private async checkInactivity(): Promise<void> {
        const now = Date.now();

        for (const [gameId, tracker] of this.inactivityTrackers.entries()) {
            const inactivityDuration = now - tracker.lastMoveTimestamp;
            const inactivityThreshold =
                tracker.totalGameTime * InactivityService.INACTIVITY_THRESHOLD;

            // if inactivity duration is greater than threshold, start countdown
            if (
                inactivityDuration >= inactivityThreshold &&
                !tracker.isCountingDown
            ) {
                tracker.isCountingDown = true;
            }

            // if isCountingDown, update countdown
            if (tracker.isCountingDown) {
                tracker.inactivityCountdown -=
                    InactivityService.UPDATE_INTERVAL;

                this.emitUpdateInactivityCountdown(tracker);

                // if countdown reaches 0, emit event and stop tracking
                if (tracker.inactivityCountdown <= 0) {
                    const winner = tracker.activePlayer === "w" ? "b" : "w";
                    await this.eventEmitter.emit("inactivity.timeout", {
                        gameId,
                        winner,
                    });
                    this.stopTracking(gameId);
                }
            }
        }
    }

    /**
     * Emits an event to update the inactivity countdown for a game.
     *
     * @param inactivePlayerId - The unique identifier of the inactive player.
     * @param tracker - The inactivity data tracker containing the active player and remaining countdown time.
     */
    private emitUpdateInactivityCountdown(tracker: InactivityData): void {
        const inactivePlayerId =
            tracker.activePlayer === "w"
                ? tracker.whitePlayerId
                : tracker.blackPlayerId;

        this.eventEmitter.emit("inactivity.countdown.update", {
            inactivePlayerId,
            remainingMiliseconds: tracker.inactivityCountdown,
        });
    }
}

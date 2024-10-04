import { Injectable } from "@nestjs/common";

@Injectable()
/** Own separate service since this can scalate */
export class EloService {
    calculateNewElo(
        currentElo: number,
        opponentElo: number,
        result: number,
    ): number {
        const kFactor = 32; // ajust factor
        const expectedScore =
            1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
        const newElo = currentElo + kFactor * (result - expectedScore);
        return Math.round(newElo);
    }
}

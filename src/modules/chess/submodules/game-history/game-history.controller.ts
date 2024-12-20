import {
    Controller,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Query,
} from "@nestjs/common";
import { GameHistoryService } from "./game-history.service";
import { Game, GameModeType } from "../../entities/db/game.entity";

@Controller("game-history")
export class GameHistoryController {
    constructor(private readonly gameHistoryService: GameHistoryService) {}

    // TODO: The userId could be extracted from the token (AuthGuard)
    @Get()
    async getGameHistory(
        @Query("userId") userId: number,
        @Query("mode") mode?: string,
        @Query("side") side?: "w" | "b",
        @Query("result") result?: "win" | "draw" | "loss",
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
    ): Promise<Game[]> {
        try {
            const history = await this.gameHistoryService.getUserGameHistory(
                userId,
                mode as GameModeType,
                side,
                result,
                page,
                limit,
            );
            if (!history) {
                throw new NotFoundException(
                    "No game history found for this user.",
                );
            }
            return history;
        } catch (error) {
            throw new InternalServerErrorException(
                `Could not retrieve game history: ${error.message}`, // Cambia el mensaje para incluir el error
            );
        }
    }
}

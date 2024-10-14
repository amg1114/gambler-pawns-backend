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

    @Get()
    async getGameHistory(
        @Query("userId") userId: number,
        @Query("mode") mode?: string,
        @Query("side") side?: "w" | "b",
        @Query("result") result?: "win" | "draw" | "loss",
    ): Promise<Game[]> {
        try {
            const history = await this.gameHistoryService.getUserGameHistory(
                Number(userId),
                mode as GameModeType, // Asegúrate de que `mode` sea del tipo correcto
                side,
                result,
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

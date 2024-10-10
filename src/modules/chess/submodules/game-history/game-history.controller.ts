import {
    Controller,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
} from "@nestjs/common";
import { GameHistoryService } from "./game-history.service"; 
import { Game } from "../../entities/db/game.entity"; 

@Controller("game-history")
export class GameHistoryController {
    constructor(private readonly gameHistoryService: GameHistoryService) {}

    @Get(":userId")
    async getGameHistory(@Param("userId") userId: string): Promise<Game[]> {
        try {
            const history = await this.gameHistoryService.getUserGameHistory(
                Number(userId),
            );
            if (!history) {
                throw new NotFoundException(
                    "No game history found for this user.",
                );
            }
            return history;
        } catch (error) {
            throw new InternalServerErrorException(
                "Could not retrieve game history",
            );
        }
    }
}

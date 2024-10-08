import { Controller, Get, HttpCode, Param } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
    RewatchGameResponse200Dto,
    RewatchGameResponse400Dto,
    RewatchGameResponse404Dto,
    RewatchGameResponse406Dto,
} from "./responses/rewatchGameResponses.dto";

import { GetGameByGameLinkDto } from "../game-link/dto/game-link.dto";
import { GameLinkService } from "../game-link/game-link.service";

@Controller("game")
@ApiTags("game")
export class RewatchGameController {
    constructor(private gameService: GameLinkService) {}

    @Get("rewatch/:encodedId")
    @HttpCode(200)
    @ApiOperation({ summary: "Returns the game info by the game link" })
    @ApiResponse({
        status: 200,
        description: "Game found and information retrieved",
        type: RewatchGameResponse200Dto,
    })
    @ApiResponse({
        status: 400,
        description: "Validation error",
        type: RewatchGameResponse400Dto,
    })
    @ApiResponse({
        status: 406,
        description: "Invalid ID",
        type: RewatchGameResponse406Dto,
    })
    @ApiResponse({
        status: 404,
        description: "Game not found",
        type: RewatchGameResponse404Dto,
    })
    getGameLinkByGameId(@Param() param: GetGameByGameLinkDto) {
        return this.gameService.getGameByGameLink(param);
    }
}

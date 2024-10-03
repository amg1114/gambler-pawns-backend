import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import { CreateGameLinkDto, GetGameByGameLinkDto } from "./dto/game.dto";
import { GameLinkService } from "./game-link.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
    CreateGameLinkResponse201Dto,
    CreateGameLinkResponse400Dto,
} from "./responses/createGameLinkResponses.dto";
import {
    RewatchGameResponse200Dto,
    RewatchGameResponse400Dto,
    RewatchGameResponse404Dto,
    RewatchGameResponse406Dto,
} from "./responses/rewatchGameResponses.dto";

@Controller("game")
@ApiTags("game")
export class GameLinkController {
    constructor(private gameService: GameLinkService) {}

    @Post("create")
    @HttpCode(201)
    @ApiOperation({ summary: "Sets up an empty game and encodes its ID" })
    @ApiResponse({
        status: 201,
        description: "Game link created",
        type: CreateGameLinkResponse201Dto,
    })
    @ApiResponse({
        status: 400,
        description: "Validation error",
        type: CreateGameLinkResponse400Dto,
    })
    createGameLink(@Body() body: CreateGameLinkDto) {
        return this.gameService.createGameLink(body);
    }

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

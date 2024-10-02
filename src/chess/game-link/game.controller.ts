import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import { CreateGameLinkDto, GetGameByGameLinkDto } from "./dto/game.dto";
import { GameService } from "./game.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
    CreateGameLinkResponse201Dto,
    CreateGameLinkResponse400Dto,
    CreateGameLinkResponse404Dto,
} from "./responses/createGameLinkResponses.dto";

@Controller("game")
@ApiTags("game")
export class ChessController {
    constructor(private gameService: GameService) {}

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
    @ApiResponse({
        status: 404,
        description: "Wrong gameMode",
        type: CreateGameLinkResponse404Dto,
    })
    createGameLink(@Body() body: CreateGameLinkDto) {
        return this.gameService.createGameLink(body);
    }

    //TODO: Add the response DTOs after the DB is refactored
    @Get("rewatch/:id")
    @HttpCode(200)
    @ApiOperation({ summary: "Returns the game info by the game link" })
    getGameLinkByGameId(@Param("id") param: GetGameByGameLinkDto) {
        return this.gameService.getGameByGameLink(param);
    }
}

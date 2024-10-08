import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { CreateGameLinkDto } from "./dto/game-link.dto";
import { GameLinkService } from "./game-link.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
    CreateGameLinkResponse201Dto,
    CreateGameLinkResponse400Dto,
} from "./responses/createGameLinkResponses.dto";

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
}

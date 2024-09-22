import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { CreateGameLinkDto } from "./dto/gameLink.dto";
import { GameLinkService } from "./gameLink.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
    CreateGameLinkResponse201Dto,
    CreateGameLinkResponse400Dto,
    CreateGameLinkResponse404Dto,
} from "./responses/createGameLinkResponses.dto";

@Controller("game-link")
@ApiTags("game-link")
export class ChessController {
    constructor(private gameLinkService: GameLinkService) {}

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
        return this.gameLinkService.createGameLink(body);
    }
}

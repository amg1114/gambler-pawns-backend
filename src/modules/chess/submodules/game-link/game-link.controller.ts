import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { CreateGameLinkDto } from "./dto/game-link.dto";
import { GameLinkService } from "./game-link.service";
import { ApiTags } from "@nestjs/swagger";

@Controller("game")
@ApiTags("game")
export class GameLinkController {
    constructor(private gameService: GameLinkService) {}

    @Post("create")
    @HttpCode(201)
    createGameLink(@Body() body: CreateGameLinkDto) {
        return this.gameService.createGameLink(body);
    }
}

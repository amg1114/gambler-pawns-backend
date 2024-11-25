import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { CreateGameLinkDto, JoinGameLinkDto } from "./dto/game-link.dto";
import { GameLinkService } from "./game-link.service";
import { ApiTags } from "@nestjs/swagger";
import { WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@Controller("game")
@ApiTags("game")
export class GameLinkController {
    constructor(private gameService: GameLinkService) {}

    @WebSocketServer()
    server: Server;

    @Post("create")
    @HttpCode(201)
    createGameLink(@Body() body: CreateGameLinkDto) {
        return this.gameService.createGameLink(body);
    }

    @Post("join/:gameId")
    @HttpCode(200)
    joinGameLink(@Body() body: JoinGameLinkDto) {
        return this.gameService.joinGameLink(body);
    }
}

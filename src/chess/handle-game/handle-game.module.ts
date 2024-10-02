import { Module } from "@nestjs/common";
import { HandleGameService } from "./handle-game.service";
import { ChessService } from "../chess.service";

@Module({
    providers: [HandleGameService, ChessService],
})
export class HandleGameModule {}

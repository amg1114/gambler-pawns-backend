import { IsEnum, IsString } from "class-validator";
import { GameModeType, gameModeEnum } from "src/chess/entities/db/game.entity";

export class CreateGameLinkDto {
    @IsEnum(gameModeEnum)
    gameMode: GameModeType;
}

export class GetGameByGameLinkDto {
    @IsString()
    encodedId: string;
}

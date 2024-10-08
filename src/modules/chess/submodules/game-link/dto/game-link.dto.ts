import { IsEnum, IsString, MinLength } from "class-validator";
import {
    gameModeEnum,
    GameModeType,
} from "src/modules/chess/entities/db/game.entity";

export class CreateGameLinkDto {
    @IsEnum(gameModeEnum)
    gameMode: GameModeType;
}

export class GetGameByGameLinkDto {
    @IsString()
    @MinLength(4)
    encodedId: string;
}

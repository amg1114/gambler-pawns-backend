import { IsEnum, IsNumber, IsString, MinLength } from "class-validator";
import {
    gameModeEnum,
    GameModeType,
} from "src/modules/chess/entities/db/game.entity";

export class CreateGameLinkDto {
    @IsString()
    userId: string;

    @IsEnum(gameModeEnum)
    gameMode: GameModeType;

    @IsNumber()
    timeIncrementPerMoveSeconds: number;

    @IsNumber()
    timeInMinutes: number;
}

export class GetGameByGameLinkDto {
    @IsString()
    @MinLength(4)
    encodedId: string;
}

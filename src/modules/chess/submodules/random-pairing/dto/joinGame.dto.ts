import { IsNumber, IsOptional, IsString, IsEnum } from "class-validator";
import {
    GameModeType,
    gameModeEnum,
} from "src/modules/chess/entities/db/game.entity";

export class JoinGameDTO {
    @IsString()
    playerId: string;

    @IsNumber()
    eloRating: number;

    @IsEnum(gameModeEnum)
    mode: GameModeType;

    @IsOptional()
    @IsNumber()
    bet?: number;

    @IsNumber()
    initialTime: number;

    @IsNumber()
    incrementTime: number;
}
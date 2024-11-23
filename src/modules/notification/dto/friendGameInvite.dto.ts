import { IsEnum, IsNumber } from "class-validator";
import {
    gameModeEnum,
    GameModeType,
} from "src/modules/chess/entities/db/game.entity";

export class FriendGameInviteDto {
    @IsNumber()
    receiverId: number;

    @IsEnum(gameModeEnum)
    mode: GameModeType;

    @IsNumber()
    timeInMinutes: number;

    @IsNumber()
    timeIncrementPerMoveSeconds: number;
}

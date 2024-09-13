import { IsString, IsInt, IsEnum } from "class-validator";

export class JoinGameDTO {
    @IsString()
    nicknamePlayer: string;

    @IsInt()
    elo: string;

    @IsEnum(["rapid", "blitz", "bullet", "arcade"])
    game_mode: string;

    //TODO: arcade modifiers
}
// TODO: hacer que esto funcione

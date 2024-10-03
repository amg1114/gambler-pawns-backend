import { IsString, MinLength } from "class-validator";

export class CreateGameLinkDto {
    @IsString()
    gameMode: string;
}

export class GetGameByGameLinkDto {
    @IsString()
    @MinLength(4)
    encodedId: string;
}

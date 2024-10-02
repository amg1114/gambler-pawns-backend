import { IsString } from "class-validator";

export class CreateGameLinkDto {
    @IsString()
    gameMode: string;
}

export class GetGameByGameLinkDto {
    @IsString()
    encodedId: string;
}

import { IsString } from "class-validator";

export class CreateGameLinkDto {
    @IsString()
    gameMode: string;
}

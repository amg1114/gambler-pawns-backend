import { IsString } from "class-validator";

export class GameJoinLinkDto {
    @IsString()
    userId: string;

    @IsString()
    gameLink: string;
}

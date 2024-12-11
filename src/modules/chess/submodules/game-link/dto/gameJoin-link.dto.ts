import { IsString } from "class-validator";

export class GameJoinLinkDto {
    @IsString()
    gameLink: string;
}

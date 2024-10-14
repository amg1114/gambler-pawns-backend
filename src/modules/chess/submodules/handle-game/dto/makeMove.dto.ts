import { IsString } from "class-validator";

export class MakeMoveDTO {
    @IsString()
    playerId: string;

    @IsString()
    from: string;

    @IsString()
    to: string;

    @IsString()
    promotion?: string;
}

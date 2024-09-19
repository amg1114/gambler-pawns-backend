import { IsNumber, IsOptional, IsString, IsEnum } from "class-validator";

export class JoinGameDTO {
    // payload: string;

    @IsString()
    playerId: string;

    @IsNumber()
    eloRating: number;

    @IsEnum(["rapid", "blitz", "bullet"])
    mode: "rapid" | "blitz" | "bullet";

    @IsOptional()
    @IsNumber()
    bet?: number;
}

import { IsString } from "class-validator";

export class MakeMoveDTO {
    @IsString()
    from: string;

    @IsString()
    to: string;

    @IsString()
    promotion?: string;
}

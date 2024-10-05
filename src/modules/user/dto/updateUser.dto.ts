import { ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsDateString,
    IsISO31661Alpha2,
    IsOptional,
    IsString,
} from "class-validator";

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: "example@example.com" })
    email?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: "John Doe" })
    nickname?: string;

    @IsDateString()
    @IsOptional()
    @ApiPropertyOptional({ example: "2021-01-01" })
    dateOfBirth?: Date;

    @IsISO31661Alpha2()
    @IsOptional()
    @ApiPropertyOptional({ example: "CO" })
    countryCode?: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsISO31661Alpha2, IsOptional, IsString } from "class-validator";


export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @ApiProperty({ example: "example@example.com" })
    email?: string;
    
    @IsString()
    @IsOptional()
    @ApiProperty({ example: "John Doe" })
    nickname?: string;

    @IsDateString()
    @IsOptional()
    @ApiProperty({ example: "2021-01-01" })
    dateOfBirth?: Date;

    @IsISO31661Alpha2()
    @IsOptional()
    @ApiProperty({ example: "CO" })
    countryCode?: string;
}

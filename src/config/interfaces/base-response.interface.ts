import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";

export class BaseResponse {
    @IsBoolean()
    @ApiProperty({ example: true })
    status: number;

    @IsNumber()
    @ApiProperty({ example: 200 })
    statusCode: number;

    @IsString()
    @ApiProperty({ example: "/api/v1/auth/forgot-password" })
    path: string;

    @IsString()
    @ApiProperty({ example: "2024-09-15T00:33:02.738Z" })
    timestamp: string;
}

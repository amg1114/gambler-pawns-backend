import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsObject, IsString } from "class-validator";

export class ForgotPasswordResponse200Dto {
    @IsBoolean()
    @ApiProperty({ example: true })
    status: boolean;

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

export class ForgotPasswordResponse400Dto {
    @IsBoolean()
    @ApiProperty({ example: false })
    status: boolean;

    @IsNumber()
    @ApiProperty({ example: 400 })
    statusCode: number;

    @IsString()
    @ApiProperty({ example: "/api/v1/auth/forgot-password" })
    path: string;

    @IsObject()
    @ApiProperty({
        example: {
            message: ["email must be an email"],
            error: "BadRequestException",
        },
    })
    data: { message: string[]; error: string };

    @IsString()
    @ApiProperty({ example: "2024-09-15T00:30:52.121Z" })
    timestamp: string;
}

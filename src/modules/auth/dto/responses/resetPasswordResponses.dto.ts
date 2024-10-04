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
    @ApiProperty({ example: "/api/v1/auth/reset-password" })
    path: string;

    @IsString()
    @ApiProperty({ example: "2024-09-15T00:30:52.121Z" })
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
    @ApiProperty({ example: "/api/v1/auth/reset-password" })
    path: string;

    @IsObject()
    @ApiProperty({
        example: {
            message: ["token must be a jwt string"],
            error: "BadRequestException",
        },
    })
    data: { message: string[]; error: string };

    @IsString()
    @ApiProperty({ example: "2024-09-15T00:30:52.121Z" })
    timestamp: string;
}

export class ForgotPasswordResponse401Dto {
    @IsBoolean()
    @ApiProperty({ example: false })
    status: boolean;

    @IsNumber()
    @ApiProperty({ example: 401 })
    statusCode: number;

    @IsString()
    @ApiProperty({ example: "/api/v1/auth/reset-password" })
    path: string;

    @IsObject()
    @ApiProperty({
        example: {
            message: ["Invalid token"],
            error: "UnauthorizedException",
        },
    })
    data: { message: string[]; error: string };

    @IsString()
    @ApiProperty({ example: "2024-09-15T00:30:52.121Z" })
    timestamp: string;
}

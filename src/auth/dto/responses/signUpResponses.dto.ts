import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsObject, IsString } from "class-validator";

export class SignUpResponse201Dto {
    @IsBoolean()
    @ApiProperty({ example: true })
    status: boolean;

    @IsNumber()
    @ApiProperty({ example: 201 })
    statusCode: number;

    @IsString()
    @ApiProperty({ example: "/api/v1/auth/signup" })
    path: string;

    @IsObject()
    @ApiProperty({
        example: {
            access_token:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsIm5pY2tuYW1lIjoiYXNkYXNkYXNkYXNkIiwiZW1haWwiOiJsb2xhYUBsbGNvYXMuYXNkIiwiY291bnRyeUNvZGUiOiJjbyIsImFib3V0IjoiIiwiZmtVc2VyQXZhdGFySW1nSWQiOjgsImVsb1JhcGlkIjoxNTAwLCJlbG9CbGl0eiI6MTUwMCwiZWxvQnVsbGV0IjoxNTAwLCJlbG9BcmNhZGUiOjE1MDAsImN1cnJlbnRDb2lucyI6MCwiYWN1bXVsYXRlZEFsbHRpbWVDb2lucyI6MCwiblB1enpsZXNTb2x2ZWQiOjAsInN0cmVha0RheXMiOjAsImlzRGVsZXRlZCI6ZmFsc2UsImlhdCI6MTcyNjM2MDM4MiwiZXhwIjoxNzI2MzYzOTgyfQ.LTnFMD6Remkqe1Rh-y7WbT3RXMud9GhfYP0t8i3lKSI",
        },
    })
    data: { access_token: string };

    @IsString()
    @ApiProperty({ example: "2024-09-15T00:33:02.738Z" })
    timestamp: string;
}

export class SignUpResponse400Dto {
    @IsBoolean()
    @ApiProperty({ example: false })
    status: boolean;

    @IsNumber()
    @ApiProperty({ example: 400 })
    statusCode: number;

    @IsString()
    @ApiProperty({ example: "/api/v1/auth/signup" })
    path: string;

    @IsObject()
    @ApiProperty({
        example: {
            message: ["nickname must be longer than or equal to 3 characters"],
            error: "BadRequestException",
        },
    })
    data: { message: string[]; error: string };

    @IsString()
    @ApiProperty({ example: "2024-09-15T00:30:52.121Z" })
    timestamp: string;
}

export class SignUpResponse409Dto {
    @IsBoolean()
    @ApiProperty({ example: false })
    status: boolean;

    @IsNumber()
    @ApiProperty({ example: 409 })
    statusCode: number;

    @IsString()
    @ApiProperty({ example: "/api/v1/auth/signup" })
    path: string;

    @IsObject()
    @ApiProperty({
        example: {
            message: ["Nickname or email is already registered"],
            error: "ConflictException",
        },
    })
    data: { message: string[]; error: string };

    @IsString()
    @ApiProperty({ example: "2024-09-15T00:21:04.340Z" })
    timestamp: string;
}

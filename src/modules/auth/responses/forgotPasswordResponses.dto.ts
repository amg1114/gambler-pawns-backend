import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordResponse200Dto {
    @ApiProperty({ example: true })
    status: boolean;

    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: "/api/v1/auth/forgot-password" })
    path: string;

    @ApiProperty({ example: "2024-09-15T00:33:02.738Z" })
    timestamp: string;
}

export class ForgotPasswordResponse400Dto {
    @ApiProperty({ example: false })
    status: boolean;

    @ApiProperty({ example: 400 })
    statusCode: number;

    @ApiProperty({ example: "/api/v1/auth/forgot-password" })
    path: string;

    @ApiProperty({
        example: {
            message: ["email must be an email"],
            error: "BadRequestException",
        },
    })
    data: { message: string[]; error: string };

    @ApiProperty({ example: "2024-09-15T00:30:52.121Z" })
    timestamp: string;
}

import { ApiProperty } from "@nestjs/swagger";

export class CreateGameLinkResponse201Dto {
    @ApiProperty({ example: true })
    status: boolean;

    @ApiProperty({ example: 201 })
    statusCode: number;

    @ApiProperty({ example: "/api/v1/game-link/create" })
    path: string;

    @ApiProperty({
        example: {
            encodedGameId: "uQ9n",
        },
    })
    data: { encodedGameId: string };

    @ApiProperty({ example: "2024-09-15T00:33:02.738Z" })
    timestamp: string;
}

export class CreateGameLinkResponse400Dto {
    @ApiProperty({ example: false })
    status: boolean;

    @ApiProperty({ example: 400 })
    statusCode: number;

    @ApiProperty({ example: "/api/v1/game-link/create" })
    path: string;

    @ApiProperty({
        example: {
            message: ["gameMode must be a string"],
            error: "BadRequestException",
        },
    })
    data: { message: string[]; error: string };

    @ApiProperty({ example: "2024-09-15T00:33:02.738Z" })
    timestamp: string;
}

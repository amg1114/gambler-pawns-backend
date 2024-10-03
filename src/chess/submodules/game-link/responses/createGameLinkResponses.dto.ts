import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsObject, IsString } from "class-validator";

export class CreateGameLinkResponse201Dto {
    @IsBoolean()
    @ApiProperty({ example: true })
    status: boolean;

    @IsNumber()
    @ApiProperty({ example: 201 })
    statusCode: number;

    @IsString()
    @ApiProperty({ example: "/api/v1/game-link/create" })
    path: string;

    @IsObject()
    @ApiProperty({
        example: {
            encodedGameId: "uQ9n",
        },
    })
    data: { encodedGameId: string };

    @IsString()
    @ApiProperty({ example: "2024-09-15T00:33:02.738Z" })
    timestamp: string;
}

export class CreateGameLinkResponse400Dto {
    @IsBoolean()
    @ApiProperty({ example: false })
    status: boolean;

    @IsNumber()
    @ApiProperty({ example: 400 })
    statusCode: number;

    @IsString()
    @ApiProperty({ example: "/api/v1/game-link/create" })
    path: string;

    @IsObject()
    @ApiProperty({
        example: {
            message: ["gameMode must be a string"],
            error: "BadRequestException",
        },
    })
    data: { message: string[]; error: string };

    @IsString()
    @ApiProperty({ example: "2024-09-15T00:33:02.738Z" })
    timestamp: string;
}

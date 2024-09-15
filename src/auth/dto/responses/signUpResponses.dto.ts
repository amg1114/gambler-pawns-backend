import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsJWT, IsNumber, IsString } from "class-validator";

export class SignUpResponse201Dto {
    @IsJWT()
    @ApiProperty({
        example:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5pY2tuYW1lIjoicGFpc2l0YSIsImVtYWlsIjoibG9sYUBsbGNvYXMuYXNkIiwiY291bnRyeUNvZGUiOiJjbyIsImFib3V0IjoiIiwiZmtVc2VyQXZhdGFySW1nSWQiOjI1LCJlbG9SYXBpZCI6MTUwMCwiZWxvQmxpdHoiOjE1MDAsImVsb0J1bGxldCI6MTUwMCwiZWxvQXJjYWRlIjoxNTAwLCJjdXJyZW50Q29pbnMiOjAsImFjdW11bGF0ZWRBbGx0aW1lQ29pbnMiOjAsIm5QdXp6bGVzU29sdmVkIjowLCJzdHJlYWtEYXlzIjowLCJpc0RlbGV0ZWQiOmZhbHNlLCJpYXQiOjE3MjYzNDkwNTUsImV4cCI6MTcyNjM1MjY1NX0.1wJNmBCA5Vi_1vf_4ZuY0hDshk9zwVsuH0UyUKwPjps",
    })
    access_token: string;
}

export class SignUpResponse400Dto {
    @IsArray()
    @ApiProperty({
        example: ["nickname must be longer than or equal to 3 characters"],
    })
    message: string[];

    @IsString()
    @ApiProperty({ example: "Bad Request" })
    error: string;

    @IsNumber()
    @ApiProperty({ example: 400 })
    statusCode: number;
}

export class SignUpResponse409Dto {
    @IsString()
    @ApiProperty({
        example: "Nickname or email is already registered",
    })
    message: string;

    @IsString()
    @ApiProperty({ example: "Conflict" })
    error: string;

    @IsNumber()
    @ApiProperty({ example: 409 })
    statusCode: number;
}

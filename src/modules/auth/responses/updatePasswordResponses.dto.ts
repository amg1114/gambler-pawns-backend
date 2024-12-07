import { ApiProperty } from "@nestjs/swagger";

export class UpdatePassword200Dto {
    @ApiProperty({ example: true })
    status: boolean;
    @ApiProperty({ example: 200 })
    statusCode: number;
    @ApiProperty({ example: "/api/v1/auth/update-password" })
    path: string;
    @ApiProperty({ example: { message: ["Password updated successfully"] } })
    data: {
        message: string[];
        error: string;
    };
    @ApiProperty({ example: "2024-09-15T00:33:02.738Z" })
    timestamp: Date;
}

export class UpdatePassword401Dto {
    @ApiProperty({ example: false })
    status: boolean;
    @ApiProperty({ example: 401 })
    statusCode: number;
    @ApiProperty({ example: "/api/v1/auth/update-password" })
    @ApiProperty({ example: { message: ["Password is incorrect"] } })
    data: {
        message: string[];
        error: string;
    };
    @ApiProperty({ example: "2024-09-15T00:33:02.738Z" })
    timestamp: Date;
}

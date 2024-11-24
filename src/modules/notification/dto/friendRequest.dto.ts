import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class FriendRequestDto {
    @IsNumber()
    @ApiProperty({ example: 1 })
    receiverId: number;
}

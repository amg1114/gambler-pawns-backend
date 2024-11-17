import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class FriendGameInviteDto {
    @IsNumber()
    @ApiProperty({ example: 1 })
    receiverId: number;
}

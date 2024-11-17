import { IsNumber } from "class-validator";

export class AcceptFriendGameInviteDto {
    @IsNumber()
    notificationId: number;
}

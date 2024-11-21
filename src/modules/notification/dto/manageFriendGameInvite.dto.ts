import { IsNumber } from "class-validator";

export class ManageFriendGameInviteDto {
    @IsNumber()
    notificationId: number;
}

import { IsNumber } from "class-validator";

export class ManageFriendRequestDto {
    @IsNumber()
    notificationId: number;
}

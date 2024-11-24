import { Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/common/guards/auth.guard";
import { NotificationService } from "./notification.service";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { GetAllNotificationsResponse200Dto } from "./responses/getAllNotificationsResponses.dto";

@Controller("notification")
@ApiTags("notification")
export class NotificationController {
    constructor(private notificationService: NotificationService) {}

    @Get("get-all")
    @ApiBearerAuth()
    @ApiOperation({ summary: "Gets all notifications for authenticated user" })
    @ApiResponse({
        status: 200,
        description: "Returns array containing all user's notifications",
        type: GetAllNotificationsResponse200Dto,
    })
    @UseGuards(AuthGuard)
    async getAllNotifications(@Req() req: any) {
        return this.notificationService.getAllNotifications(req.user.userId);
    }

    @Patch("mark-all-as-read")
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Marks all notifications as read for authenticated user",
    })
    @ApiResponse({
        status: 200,
        description: "Notifications marked as read successfully",
    })
    @UseGuards(AuthGuard)
    async markAllAsRead(@Req() req: any) {
        return this.notificationService.markAllAsRead(req.user.userId);
    }
}

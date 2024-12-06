import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";

import { UserService } from "./user.service";
import { User } from "./entities/user.entity";
import { UpdateResult } from "typeorm";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { AuthGuard } from "src/common/guards/auth.guard";
import { SearchReponse200Dto } from "./dto/responses/searchResponses.dto";

@Controller("user")
@ApiTags("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("search")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Search users and flags those who are friends with the user",
    })
    @ApiResponse({
        status: 200,
        description: "Users fetched successfully",
        type: SearchReponse200Dto,
    })
    async searchUsers(@Query("query") query: string, @Req() req: any) {
        const userId = req.user.userId;
        return this.userService.searchUsers(query, userId);
    }

    @Get(":nickname")
    @ApiOperation({ summary: "Get user data by nickname" })
    @ApiResponse({ status: 200, description: "User data found successfully" })
    getUsers(@Param("nickname") nickname: string): Promise<User | null> {
        return this.userService.getUserInfo(nickname);
    }

    //TODO: Verify with the JWT token if the user is the same as the one in the params (req.user)
    //TODO: Add case 401 - unauthorized
    @Patch(":id")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update user data" })
    @ApiResponse({ status: 200, description: "User data updated successfully" })
    @ApiResponse({ status: 404, description: "User not found" })
    updateUser(
        @Param("id") id: number,
        @Body() userFields: UpdateUserDto,
    ): Promise<UpdateResult> {
        return this.userService.updateUserById(id, userFields);
    }

    //TODO: Verify with the JWT token if the user is the same as the one in the params
    @Patch(":id/avatar")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Update user avatar" })
    @ApiResponse({
        status: 200,
        description: "User avatar updated successfully",
    })
    @ApiResponse({ status: 404, description: "User not found" })
    @ApiResponse({ status: 404, description: "Avatar not found" })
    updateAvatar(
        @Param("id") id: number,
        @Body("filename") filename: string,
    ): Promise<User> {
        return this.userService.updateUserAvatar(id, filename);
    }

    @Get(":id/friends")
    @ApiOperation({ summary: "Get user friends" })
    @ApiResponse({ status: 200, description: "Friends fetched successfully" })
    async getUserFriends(@Param("id") id: number) {
        return this.userService.findUserFriends(id);
    }

    @Post("/remove-friend")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Remove a friend" })
    @ApiResponse({ status: 200, description: "Friend remove successfully" })
    async removeFriend(@Body("friendId") friendId: number, @Req() req: any) {
        const userId = req.user.userId;
        return this.userService.removeFriend(userId, friendId);
    }
}

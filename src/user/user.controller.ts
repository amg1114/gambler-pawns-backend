import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UserService } from "./user.service";
import { User } from "./entities/user.entity";
import { UpdateResult } from "typeorm";
import { UpdateUserDto } from "./dto/updateUser.dto";

@Controller("user")
@ApiTags("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(":nickname")
    @ApiOperation({ summary: "Get user data by nickname" })
    @ApiResponse({ status: 200, description: "User data found successfully" })
    getUsers(@Param("nickname") nickname: string): Promise<User | null> {
        return this.userService.findOneByNickname(nickname);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update user data" })
    @ApiResponse({ status: 200, description: "User data updated successfully" })
    @ApiResponse({ status: 404, description: "User not found" })
    updateUser(
        @Param("id") id: number,
        @Body() userFields: UpdateUserDto,
    ): Promise<UpdateResult> {
        return this.userService.updateUser(id, userFields);
    }

    @Get(":id/friends")
    @ApiOperation({ summary: "Get user friends" })
    @ApiResponse({ status: 200, description: "Friends fetched successfully" })
    async getUserFriends(@Param("id") id: number) {
        return this.userService.findUserFriends(id);
    }
}

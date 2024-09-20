import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UserService } from "./user.service";
import { User } from './entities/user.entity';

@Controller('user')
@ApiTags('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(":nickname")
    getUsers(@Param("nickname") nickname: string): Promise<User|null> {
        return this.userService.findOneByNickname(nickname)
    }
    
}

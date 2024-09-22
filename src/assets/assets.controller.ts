import { Controller, Get, Param, Res } from "@nestjs/common";
import { join } from "path";
import { Response } from "express";

import { AssetsService } from "./assets.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("assets")
@ApiTags("assets")
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) {}

    @ApiOperation({ summary: "Get the list of avatar images" })
    @ApiResponse({ status: 200, description: "List of avatar images" })
    @Get("avatars")
    async getAvatarList() {
        return this.assetsService.getAvatarList();
    }

    @ApiOperation({ summary: "Get an avatar image" })
    @ApiResponse({ status: 200, description: "Avatar image" })
    @ApiResponse({ status: 404, description: "Avatar not found" })
    @Get("avatars/:id")
    async getAvatar(@Param("id") id: string, @Res() res: Response) {
        const avatar = await this.assetsService.getAvatar(parseInt(id));
        return res.sendFile(join(process.cwd(), avatar));
    }
}

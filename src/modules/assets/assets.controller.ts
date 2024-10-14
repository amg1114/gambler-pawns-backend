import { Controller, Get } from "@nestjs/common";

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
}

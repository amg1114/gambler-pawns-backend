import { Controller, Get, HttpCode } from "@nestjs/common";
import { PuzzleService } from "./puzzle.service";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetRandomPuzzleResponses200Dto } from "./responses/getRandomPuzzleResponses.dto";

@Controller("puzzle")
@ApiTags("puzzle")
export class PuzzleController {
    constructor(private puzzleService: PuzzleService) {}

    @Get("random")
    @HttpCode(200)
    @ApiResponse({
        status: 200,
        description: "Random puzzle retrieved",
        type: GetRandomPuzzleResponses200Dto,
    })
    async getRandomPuzzle() {
        return this.puzzleService.getRandomPuzzle();
    }
}

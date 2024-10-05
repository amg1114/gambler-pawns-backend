import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Puzzle } from "./entities/puzzle.entity";
import { UserSolvedPuzzle } from "./entities/userSolvedPuzzle.entity";
import { PuzzleService } from "./puzzle.service";
import { PuzzleController } from "./puzzle.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Puzzle, UserSolvedPuzzle])],
    providers: [PuzzleService],
    controllers: [PuzzleController],
})
export class PuzzleModule {}

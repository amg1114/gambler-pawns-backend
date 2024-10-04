import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Puzzle } from "./entities/puzzle.entity";
import { UserSolvedPuzzle } from "./entities/userSolvedPuzzle.entity";

@Module({ imports: [TypeOrmModule.forFeature([Puzzle, UserSolvedPuzzle])] })
export class PuzzleModule {}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Puzzle } from "./entities/puzzle.entity";
import { Repository } from "typeorm";

@Injectable()
export class PuzzleService {
    constructor(
        @InjectRepository(Puzzle)
        private puzzleEntityRepository: Repository<Puzzle>,
    ) {}

    async getRandomPuzzle() {
        const totalPuzzles = await this.puzzleEntityRepository.count();

        const randomIndex = Math.round(Math.random() * totalPuzzles);

        const puzzle = await this.puzzleEntityRepository
            .createQueryBuilder()
            .skip(randomIndex)
            .take(1)
            .getOne();

        const { puzzleId, userSolvedPuzzles, ...puzzleData } = puzzle;
        return puzzleData;
    }

    async getPuzzleById(id: string) {
        return this.puzzleEntityRepository.findOne({
            where: { lichessId: id },
        });
    }
}

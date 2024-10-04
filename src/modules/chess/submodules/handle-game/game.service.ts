import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game as GameEntity } from "../../entities/db/game.entity";

@Injectable()
/** Handle game operations in db */
export class GameService {
    constructor(
        @InjectRepository(GameEntity)
        private readonly gameRepository: Repository<GameEntity>,
    ) {}

    async createGame(gameData: Partial<GameEntity>): Promise<GameEntity> {
        const newGame = this.gameRepository.create(gameData);
        return this.gameRepository.save(newGame);
    }

    async updateGameResult(
        gameId: string,
        gameData: Partial<GameEntity>,
    ): Promise<void> {
        await this.gameRepository.update(gameId, gameData);
    }
}

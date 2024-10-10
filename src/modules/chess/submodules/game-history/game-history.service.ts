import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game } from "../../entities/db/game.entity";
import { User } from "../../../user/entities/user.entity";

@Injectable()
export class GameHistoryService {
    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getUserGameHistory(userId: number): Promise<Game[]> {
        const user = await this.userRepository.findOne({ where: { userId } });

        if (!user) {
            throw new Error("User not found");
        }

        const games = await this.gameRepository.find({
            where: [{ whitesPlayer: user }, { blacksPlayer: user }],
            relations: ["whitesPlayer", "blacksPlayer"],
            order: { gameTimestamp: "ASC" },
        });

        return games;
    }
}

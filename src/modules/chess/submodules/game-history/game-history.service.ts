import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game } from "../../entities/db/game.entity";
import { User } from "../../../user/entities/user.entity";
import { GameModeType } from "../../entities/db/game.entity";
import { GameLinkService } from "../game-link/game-link.service";

@Injectable()
export class GameHistoryService {
    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly gameLinkService: GameLinkService,
    ) {}

    async getUserGameHistory(
        userId: number,
        mode?: GameModeType,
        side?: "w" | "b",
        result?: "win" | "draw" | "loss",
    ): Promise<any[]> {
        const user = await this.userRepository.findOne({ where: { userId } });

        if (!user) {
            throw new Error("User not found");
        }

        const query = this.gameRepository
            .createQueryBuilder("game")
            .leftJoinAndSelect("game.whitesPlayer", "whitesPlayer")
            .leftJoinAndSelect("game.blacksPlayer", "blacksPlayer")
            .where(
                "whitesPlayer.userId = :userId OR blacksPlayer.userId = :userId",
                { userId },
            );

        // Filtros dinámicos
        if (mode) {
            query.andWhere("game.gameMode = :mode", { mode });
        }

        if (side) {
            if (side === "w") {
                query.andWhere("whitesPlayer.userId = :userId", { userId });
            } else if (side === "b") {
                query.andWhere("blacksPlayer.userId = :userId", { userId });
            }
        }

        if (result) {
            switch (result) {
                case "win":
                    query.andWhere(
                        "(whitesPlayer.userId = :userId AND game.winner = 'w') OR (blacksPlayer.userId = :userId AND game.winner = 'b')",
                        { userId },
                    );
                    break;
                case "loss":
                    query.andWhere(
                        "(whitesPlayer.userId = :userId AND game.winner = 'b') OR (blacksPlayer.userId = :userId AND game.winner = 'w')",
                        { userId },
                    );
                    break;
                case "draw":
                    query.andWhere("game.winner = 'draw'");
                    break;
            }
        }

        const games = await query
            .orderBy("game.gameTimestamp", "ASC")
            .getMany();

        console.log("mode", mode);
        console.log("side", side);
        console.log("result", result);
        console.log("userId", userId);

        // Mapear los resultados
        return games.map((game) => {
            const isWhite = game.whitesPlayer.userId === userId;

            return {
                gameDate: game.gameTimestamp,
                mode: game.gameMode,
                eloBefore: isWhite
                    ? game.eloWhitesBeforeGame
                    : game.eloBlacksBeforeGame,
                eloAfter: isWhite
                    ? game.eloWhitesAfterGame
                    : game.eloBlacksAfterGame,
                winner: game.winner,
                gameIdEncrypted: this.gameLinkService.genGameLinkEncodeByGameId(
                    game.gameId,
                ), // Encriptar el gameId
            };
        });
    }
}

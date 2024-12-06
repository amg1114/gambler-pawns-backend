import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game } from "../../entities/db/game.entity";
import { User } from "../../../user/entities/user.entity";
import { GameModeType } from "../../entities/db/game.entity";
import { GameLinkService } from "../game-link/game-link.service";
import { UserAvatarImg } from "src/modules/user/entities/userAvatar.entity";

@Injectable()
export class GameHistoryService {
    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserAvatarImg)
        private readonly userAvatarImgRepository: Repository<UserAvatarImg>,
        private readonly gameLinkService: GameLinkService,
    ) {}

    async getUserGameHistory(
        userId: number,
        mode?: GameModeType,
        side?: "w" | "b",
        result?: "win" | "draw" | "loss",
        page: number = 1,
        limit: number = 10,
    ): Promise<any> {
        const user = await this.userRepository.findOne({ where: { userId } });

        if (!user) {
            throw new Error("User not found");
        }

        const query = this.gameRepository
            .createQueryBuilder("game")
            .leftJoinAndSelect("game.whitesPlayer", "whitesPlayer")
            .leftJoinAndSelect("game.blacksPlayer", "blacksPlayer")
            .leftJoinAndSelect("whitesPlayer.userAvatarImg", "whiteAvatar")
            .leftJoinAndSelect("blacksPlayer.userAvatarImg", "blackAvatar");

        let whereClause = "";
        const parameters: Record<string, any> = { userId };

        // Filtro según el side (lado del jugador)
        if (side === "w") {
            whereClause += "whitesPlayer.userId = :userId";
        } else if (side === "b") {
            whereClause += "blacksPlayer.userId = :userId";
        } else {
            whereClause +=
                "(whitesPlayer.userId = :userId OR blacksPlayer.userId = :userId)";
        }

        // Condición para el modo de juego
        if (mode) {
            whereClause += " AND game.gameMode = :mode";
            parameters["mode"] = mode;
        }

        // Condición para el resultado
        if (result) {
            if (result === "win") {
                whereClause +=
                    " AND ((whitesPlayer.userId = :userId AND game.winner = 'w') OR (blacksPlayer.userId = :userId AND game.winner = 'b'))";
            } else if (result === "loss") {
                whereClause +=
                    " AND ((whitesPlayer.userId = :userId AND game.winner = 'b') OR (blacksPlayer.userId = :userId AND game.winner = 'w'))";
            } else if (result === "draw") {
                whereClause += " AND game.winner = 'draw'";
            }
        }

        // Aplicar la cláusula WHERE completa
        query.where(whereClause, parameters);

        // Aplicar paginación
        const [games, total] = await query
            .orderBy("game.gameTimestamp", "DESC")
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        if (games.length === 0) {
            throw new NotFoundException("No game history found for this page.");
        }

        // Mapear los resultados
        const resultData = games.map((game) => {
            const isWhite = game.whitesPlayer.userId === userId;
            return {
                opponentNickname: isWhite
                    ? game.blacksPlayer.nickname
                    : game.whitesPlayer.nickname,
                gameDate: game.gameTimestamp,
                mode: game.gameMode,
                eloBefore: isWhite
                    ? game.eloWhitesBeforeGame
                    : game.eloBlacksBeforeGame,
                eloAfter: isWhite
                    ? game.eloWhitesAfterGame
                    : game.eloBlacksAfterGame,
                opponentAvatar: isWhite
                    ? game.blacksPlayer.userAvatarImg?.fileName
                    : game.whitesPlayer.userAvatarImg?.fileName,
                gameIdEncrypted: this.gameLinkService.genGameLinkEncodeByGameId(
                    game.gameId,
                ),
            };
        });

        // Devolver resultados paginados
        return {
            data: resultData,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game } from "../../entities/db/game.entity";
import { User } from "../../../user/entities/user.entity";
import { GameModeType } from "../../entities/db/game.entity";
import { GameLinkService } from "../game-link/game-link.service"; // Servicio que encripta el gameId

@Injectable()
export class GameHistoryService {
    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly gameLinkService: GameLinkService, // Para el encriptado del gameId
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
            query.andWhere("game.mode = :mode", { mode });
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
                        "(whitesPlayer.userId = :userId AND game.result = 'w') OR (blacksPlayer.userId = :userId AND game.result = 'b')",
                        { userId },
                    );
                    break;
                case "loss":
                    query.andWhere(
                        "(whitesPlayer.userId = :userId AND game.result = 'b') OR (blacksPlayer.userId = :userId AND game.result = 'w')",
                        { userId },
                    );
                    break;
                case "draw":
                    query.andWhere("game.result = 'd'");
                    break;
            }
        }

        const games = await query
            .orderBy("game.gameTimestamp", "ASC")
            .getMany();

        // Mapear los resultados para devolver la información requerida
        return games.map((game) => {
            const isWhite = game.whitesPlayer.userId === userId;
            const opponent = isWhite ? game.blacksPlayer : game.whitesPlayer;

            return {
                opponentAvatar: opponent.userAvatarImg?.fileName,
                opponentNickname: opponent.nickname,
                opponentElo: (() => {
                    switch (game.gameMode) {
                        case "rapid":
                            return isWhite
                                ? game.blacksPlayer.eloRapid
                                : game.whitesPlayer.eloRapid;
                        case "blitz":
                            return isWhite
                                ? game.blacksPlayer.eloBlitz
                                : game.whitesPlayer.eloBlitz;
                        case "bullet":
                            return isWhite
                                ? game.blacksPlayer.eloBullet
                                : game.whitesPlayer.eloBullet;
                        case "arcade":
                            return isWhite
                                ? game.blacksPlayer.eloArcade
                                : game.whitesPlayer.eloArcade;
                        default:
                            return null; // Si no hay un modo de juego válido, retorna null
                    }
                })(),
                mode: game.gameMode,
                gameDate: game.gameTimestamp,
                gameIdEncrypted: this.gameLinkService.genGameLinkEncodeByGameId(
                    game.gameId,
                ), // Encriptar el gameId
            };
        });
    }
}

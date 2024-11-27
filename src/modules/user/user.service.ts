import {
    BadRequestException,
    ConflictException,
    HttpException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Brackets, QueryRunner, Repository, UpdateResult } from "typeorm";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { UserAvatarImg } from "./entities/userAvatar.entity";
import { GameModeType, GameWinner } from "../chess/entities/db/game.entity";
import { PlayerCandidateVerifiedData } from "../chess/submodules/players.service";
import { BLACK, WHITE } from "chess.js";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(UserAvatarImg)
        private userAvatarImgRepository: Repository<UserAvatarImg>,
    ) {}

    private friendsCache = new Map<number, Set<number>>();

    // db operations, ¿Should we use Abstract Repository Pattern to decople Business logic from data Access?
    async findOneByEmailOrNickname(
        email: string,
        nickname: string,
    ): Promise<User | null> {
        return this.userRepository.findOne({
            where: [{ email: email }, { nickname: nickname }],
        });
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email: email } });
    }

    async findOneByNickname(nickname: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { nickname: nickname },
        });
    }

    async getUserInfo(nickname: string) {
        const user = await this.findOneByNickname(nickname);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    async updateUserById(
        id: number,
        newData: UpdateUserDto,
    ): Promise<UpdateResult> {
        try {
            if (newData.email || newData.nickname) {
                const user = await this.findOneByEmailOrNickname(
                    newData.email,
                    newData.nickname,
                );
                if (user) {
                    throw new ConflictException(
                        "Email or nickname already in use",
                    );
                }
            }

            const result = await this.userRepository.update(id, newData);
            if (result.affected === 0) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            return result;
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
            }
            throw new HttpException("Internal Server error", 500);
        }
    }

    //TODO: Fix this because wtf is this shit even doing
    async updateUserAvatar(id: number, fileName: string) {
        try {
            const avatar = await this.userAvatarImgRepository.findOne({
                where: { fileName },
            });

            if (!avatar) {
                throw new NotFoundException("Avatar not found");
            }

            const updateResult = await this.userRepository.update(id, {
                userAvatarImg: avatar,
            });

            if (updateResult.affected === 0) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            return this.userRepository.findOne({
                where: { userId: id },
                select: ["userAvatarImg"],
            });
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
            }
            throw new HttpException("Internal Server error", 500);
        }
    }

    async findUserFriends(userId: number, page: number = 1, limit: number = 5) {
        const [friendsList, totalFriends] = await this.userRepository
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.friends", "friend")
            .leftJoinAndSelect("user.userAvatarImg", "userAvatarImg")
            .leftJoinAndSelect("friend.userAvatarImg", "friendAvatarImg")
            .where(
                // Usamos paréntesis para agrupar las condiciones correctamente
                new Brackets((qb) => {
                    qb.where("user.userId = :userId", { userId }).orWhere(
                        "friend.userId = :userId",
                        { userId },
                    );
                }),
            )
            .andWhere("user.userId != :userId", { userId }) // Excluimos al usuario actual
            .andWhere("friend.userId IS NOT NULL") // Nos aseguramos que solo traiga amigos reales
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        if (!friendsList) {
            throw new Error("User not found");
        }

        return {
            totalFriends,
            friendsList,
        };
    }

    private async updateWinnerStats(
        queryRunner: QueryRunner,
        playerId: string,
        newElo: number,
        gameMode: GameModeType,
    ) {
        const eloField = this.getEloFieldByGameMode(gameMode);
        await queryRunner.manager
            .createQueryBuilder()
            .update(User)
            .set({
                streakDays: () => "streak_days + 1",
                currentCoins: () => "current_coins + 10",
                acumulatedAllTimeCoins: () => "acumulated_all_time_coins + 10",
                [eloField]: newElo,
            })
            .where("userId = :userId", { userId: playerId })
            .execute();
    }

    private async updateLoserStats(
        queryRunner: QueryRunner,
        playerId: string,
        newElo: number,
        gameMode: GameModeType,
    ) {
        const eloField = this.getEloFieldByGameMode(gameMode);
        await queryRunner.manager
            .createQueryBuilder()
            .update(User)
            .set({
                streakDays: 0,
                [eloField]: newElo,
            })
            .where("userId = :userId", { userId: playerId })
            .execute();
    }

    private async updateDrawStats(
        queryRunner: QueryRunner,
        playerId: string,
        newElo: number,
        gameMode: GameModeType,
    ) {
        const eloField = this.getEloFieldByGameMode(gameMode);
        await queryRunner.manager
            .createQueryBuilder()
            .update(User)
            .set({
                [eloField]: newElo,
            })
            .where("userId = :userId", { userId: playerId })
            .execute();
    }

    private getEloFieldByGameMode(gameMode: GameModeType): string {
        const getEloFieldObjectLookup = {
            rapid: "eloRapid",
            blitz: "eloBlitz",
            bullet: "eloBullet",
            arcade: "eloArcade",
        };

        return getEloFieldObjectLookup[gameMode];
    }

    /**
     * Updates the players' statistics after a game.
     *
     * @param {GameWinner} winner - The winner of the game ("w" for white, "b" for black, "draw" for a tie).
     * @param {PlayerCandidateVerifiedData} blacksPlayer - The black player.
     * @param {PlayerCandidateVerifiedData} whitesPlayer - The white player.
     * @param {number} blacksNewElo - The new ELO rating for the black player.
     * @param {number} whitesNewElo - The new ELO rating for the white player.
     * @param {GameModeType} gameMode - The game mode (rapid, blitz, bullet, arcade).
     * @throws {Error} If an error occurs during the transaction.
     */
    async updatePlayersStats(
        winner: GameWinner,
        blacksPlayer: PlayerCandidateVerifiedData,
        whitesPlayer: PlayerCandidateVerifiedData,
        blacksNewElo: number,
        whitesNewElo: number,
        gameMode: GameModeType,
    ) {
        const queryRunner =
            this.userRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (winner === BLACK) {
                if (!blacksPlayer.isGuest) {
                    await this.updateWinnerStats(
                        queryRunner,
                        blacksPlayer.userInfo.userId.toString(),
                        blacksNewElo,
                        gameMode,
                    );
                }
                if (!whitesPlayer.isGuest) {
                    await this.updateLoserStats(
                        queryRunner,
                        whitesPlayer.userInfo.userId.toString(),
                        whitesNewElo,
                        gameMode,
                    );
                }
            } else if (winner === WHITE) {
                if (!whitesPlayer.isGuest) {
                    await this.updateWinnerStats(
                        queryRunner,
                        whitesPlayer.userInfo.userId.toString(),
                        whitesNewElo,
                        gameMode,
                    );
                }
                if (!blacksPlayer.isGuest) {
                    await this.updateLoserStats(
                        queryRunner,
                        blacksPlayer.userInfo.userId.toString(),
                        blacksNewElo,
                        gameMode,
                    );
                }
            } else if (winner === "draw") {
                if (!blacksPlayer.isGuest) {
                    await this.updateDrawStats(
                        queryRunner,
                        blacksPlayer.userInfo.userId.toString(),
                        blacksNewElo,
                        gameMode,
                    );
                }
                if (!whitesPlayer.isGuest) {
                    await this.updateDrawStats(
                        queryRunner,
                        whitesPlayer.userInfo.userId.toString(),
                        whitesNewElo,
                        gameMode,
                    );
                }
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async searchUsers(query: string, userId: number) {
        const users = await this.userRepository
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.userAvatarImg", "userAvatarImg")
            .select([
                "user.userId",
                "user.nickname",
                "userAvatarImg.userAvatarImgId",
                "userAvatarImg.fileName",
            ])
            .where("user.nickname ILIKE :query", { query: `%${query}%` })
            .andWhere("user.userId != :userId", { userId })
            .getMany();

        const friendsSet = await this.getAllFriends(userId);

        return users.map((u) => ({
            ...u,
            isFriend: friendsSet.has(u.userId),
        }));
    }

    async getAllFriends(userId: number) {
        if (this.friendsCache.has(userId)) {
            return this.friendsCache.get(userId);
        }

        const friends = await this.userRepository
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.friends", "friend")
            .where("user.userId = :userId", { userId })
            .orWhere("friend.userId = :userId", { userId })
            .getMany();

        const friendsSet = new Set<number>();

        // Adds friends from either column of the table to the Set
        friends.forEach((user) => {
            user.friends.forEach((friend) => {
                if (friend.userId !== userId) {
                    friendsSet.add(friend.userId);
                }
            });
            if (user.userId !== userId) {
                friendsSet.add(user.userId);
            }
        });

        this.friendsCache.set(userId, friendsSet);

        return friendsSet;
    }

    async addFriend(userId: number, friendId: number): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { userId },
            relations: ["friends"],
        });
        const friend = await this.userRepository.findOne({
            where: { userId: friendId },
        });

        // Verificar si los usuarios existen
        if (!user || !friend) {
            throw new NotFoundException("User or friend not found");
        }

        // Verificar si el usuario a agregar no es el mismo
        if (userId === friendId) {
            throw new BadRequestException("Can't add yourself as a friend");
        }

        // Verificar si ya son amigos
        if (await this.areUsersFriends(userId, friendId)) {
            throw new BadRequestException("Users are already friends");
        }

        user.friends.push(friend);
        await this.userRepository.save(user);

        // Invalidate cache for the user
        this.friendsCache.delete(userId);
        this.friendsCache.delete(friendId);
    }

    async removeFriend(userId: number, friendId: number): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { userId },
            relations: ["friends"],
        });

        const friend = await this.userRepository.findOne({
            where: { userId: friendId },
            relations: ["friends"],
        });

        console.log(userId, friendId);

        // Verificar si los usuarios existen
        if (!user || !friend) {
            throw new NotFoundException("User or friend not found");
        }

        // Verificar si son amigos
        const areFriends = await this.areUsersFriends(userId, friendId);
        if (!areFriends) {
            throw new BadRequestException("Users are not friends");
        }

        // Eliminar la relación de ambos lados
        user.friends = user.friends.filter((f) => f.userId !== friendId);
        friend.friends = friend.friends.filter((f) => f.userId !== userId);

        await this.userRepository.save(user);
        await this.userRepository.save(friend);
    }

    async areUsersFriends(aUserId: number, bUserId: number) {
        const user = await this.userRepository
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.friends", "friend")
            .where("user.userId = :aUserId AND friend.userId = :bUserId", {
                aUserId,
                bUserId,
            })
            .orWhere("user.userId = :bUserId AND friend.userId = :aUserId", {
                aUserId,
                bUserId,
            })
            .getOne();

        return !!user;
    }
}

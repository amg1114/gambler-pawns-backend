import {
    ConflictException,
    HttpException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { QueryRunner, Repository, UpdateResult } from "typeorm";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { UserAvatarImg } from "./entities/userAvatar.entity";
import { GameModeType, GameWinner } from "../chess/entities/db/game.entity";

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
    async findUserFriends(userId: number) {
        const user = await this.userRepository.findOne({
            where: { userId },
            relations: ["friends"],
        });

        if (!user) {
            throw new Error("User not found");
        }

        const totalFriends = user.friends.length; // Obtener el total de amigos
        const friendsList = user.friends.slice(0, 5); // Obtener los primeros 5 amigos

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
     * @param {GameWinner} winner - The winner of the game ("b" for black, "w" for white, "draw" for a tie).
     * @param {string} blacksPlayerId - The ID of the black player.
     * @param {string} whitesPlayerId - The ID of the white player.
     * @param {number} blacksNewElo - The new ELO rating for the black player.
     * @param {number} whitesNewElo - The new ELO rating for the white player.
     * @param {GameModeType} gameMode - The game mode (rapid, blitz, bullet, arcade).
     * @throws {Error} If an error occurs during the transaction.
     */
    async updatePlayersStats(
        winner: GameWinner,
        blacksPlayerId: string,
        whitesPlayerId: string,
        blacksNewElo: number,
        whitesNewElo: number,
        gameMode: GameModeType,
    ) {
        const queryRunner =
            this.userRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (winner === "b") {
                await this.updateWinnerStats(
                    queryRunner,
                    blacksPlayerId,
                    blacksNewElo,
                    gameMode,
                );
                await this.updateLoserStats(
                    queryRunner,
                    whitesPlayerId,
                    whitesNewElo,
                    gameMode,
                );
            } else if (winner === "w") {
                await this.updateWinnerStats(
                    queryRunner,
                    whitesPlayerId,
                    whitesNewElo,
                    gameMode,
                );
                await this.updateLoserStats(
                    queryRunner,
                    blacksPlayerId,
                    blacksNewElo,
                    gameMode,
                );
            } else if (winner === "draw") {
                await this.updateDrawStats(
                    queryRunner,
                    blacksPlayerId,
                    blacksNewElo,
                    gameMode,
                );
                await this.updateDrawStats(
                    queryRunner,
                    whitesPlayerId,
                    whitesNewElo,
                    gameMode,
                );
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

    //TODO: The following are from Copilot. Use this.friendsCache.delete(userId) on both users when adding or removing friends to clear their cache.

    /* 
    async addFriend(userId: number, friendId: number): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ["friends"] });
        const friend = await this.userRepository.findOne({ where: { id: friendId } });

        if (!user || !friend) {
            throw new NotFoundException("User or friend not found");
        }

        user.friends.push(friend);
        await this.userRepository.save(user);

        // Invalidate cache for the user
        this.friendsCache.delete(userId);
    }

    async removeFriend(userId: number, friendId: number): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ["friends"] });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        user.friends = user.friends.filter(friend => friend.id !== friendId);
        await this.userRepository.save(user);

        // Invalidate cache for the user
        this.friendsCache.delete(userId);
    }
 */
}

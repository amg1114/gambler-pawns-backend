import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository, UpdateResult } from "typeorm";
import { UpdateUserDto } from "./dto/updateUser.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
    ) {}

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
        return this.userRepository.findOne({ where: { nickname: nickname } });
    }

    async updateUser(
        id: number,
        newData: UpdateUserDto,
    ): Promise<UpdateResult> {
        try {
            const result = await this.userRepository.update(id, newData);
            if (result.affected === 0) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            return result;
        } catch (e) {
            console.log(e);
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
}

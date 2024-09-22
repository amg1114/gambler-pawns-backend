import {
    ConflictException,
    HttpException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository, UpdateResult } from "typeorm";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { UserAvatarImg } from "./entities/userAvatar.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(UserAvatarImg)
        private userAvatarImgRepository: Repository<UserAvatarImg>,
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
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";

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
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserAvatarImg } from "../user/entities/userAvatar.entity";

@Injectable()
export class AssetsService {
    constructor(
        @InjectRepository(UserAvatarImg)
        private userAvatarImgRepository: Repository<UserAvatarImg>,
    ) {}

    /**
     * Get the avatar image path
     * @param id The avatar image id
     * @returns The avatar image path
     * @throws Error if the avatar image is not found
     */
    async getAvatar(id: number): Promise<string> {
        // Buscar el avatar por su ID usando TypeORM
        const avatar = await this.userAvatarImgRepository.findOne({
            where: { userAvatarImgId: id },
        });

        if (!avatar) {
            throw new NotFoundException("Avatar not found");
        }

        return `public/user_avatars/${avatar.fileName}`;
    }

    /**
     * Get the list of all avatar images
     * @returns Array of avatar images
     */
    async getAvatarList() {
        // Obtener la lista de todos los avatares ordenada por `userAvatarImgId`
        return await this.userAvatarImgRepository.find({
            order: { userAvatarImgId: "ASC" },
        });
    }
}

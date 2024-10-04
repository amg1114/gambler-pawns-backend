import { Module } from "@nestjs/common";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserAvatarImg } from "src/modules/user/entities/userAvatar.entity";

@Module({
    controllers: [AssetsController],
    providers: [AssetsService],
    imports: [
        // Importamos las entidades necesarias para el servicio
        TypeOrmModule.forFeature([UserAvatarImg]),
    ],
})
export class AssetsModule {}

import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserController } from "./user.controller";
import { UserAvatarImg } from "./entities/userAvatar.entity";

@Module({
    providers: [UserService],
    imports: [
        // Importamos las entidades necesarias para el servicio
        TypeOrmModule.forFeature([User, UserAvatarImg]),
    ],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}

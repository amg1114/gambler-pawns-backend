import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserController } from "./user.controller";
import { UserAvatarImg } from "./entities/userAvatar.entity";
import { ActiveUsersGateway } from "./active-users/active-users.gateway";
import { ActiveUsersService } from "./active-users/active-users.service";

@Module({
    providers: [UserService, ActiveUsersGateway, ActiveUsersService],
    imports: [
        // Importamos las entidades necesarias para el servicio
        TypeOrmModule.forFeature([User, UserAvatarImg]),
    ],
    controllers: [UserController],
    exports: [UserService, ActiveUsersService],
})
export class UserModule {}

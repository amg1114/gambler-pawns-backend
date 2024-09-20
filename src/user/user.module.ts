import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserController } from './user.controller';

@Module({
    providers: [UserService],
    imports: [
        // Importamos las entidades necesarias para el servicio
        TypeOrmModule.forFeature([User]),
    ],
    controllers: [UserController],
})
export class UserModule {}

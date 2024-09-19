import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";

@Module({
    providers: [UserService],
    imports: [
        // Importamos las entidades necesarias para el servicio
        TypeOrmModule.forFeature([User]),
    ],
})
export class UserModule {}

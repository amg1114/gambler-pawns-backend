import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { ConfigService } from "@nestjs/config";
import { MailerModule } from "@nestjs-modules/mailer";
import { UserService } from "src/user/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { UserAvatarImg } from "src/user/entities/userAvatar.entity";

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: { expiresIn: "1h" },
            }),
        }),
        MailerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    service: "gmail",
                    auth: {
                        user: configService.get<string>("NODEMAILER_EMAIL"),
                        pass: configService.get<string>("NODEMAILER_PASSWORD"),
                    },
                },
            }),
        }),
        TypeOrmModule.forFeature([User, UserAvatarImg]),
    ],
    providers: [AuthService, UserService],
    controllers: [AuthController],
    exports: [],
})
export class AuthModule {}

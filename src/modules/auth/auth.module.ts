import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { ConfigService } from "@nestjs/config";
import { MailerModule } from "@nestjs-modules/mailer";
import { UserService } from "src/modules/user/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/modules/user/entities/user.entity";
import { UserAvatarImg } from "src/modules/user/entities/userAvatar.entity";

@Module({
    imports: [
        MailerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    service: "gmail",
                    auth: {
                        user: configService.getOrThrow<string>(
                            "NODEMAILER_EMAIL",
                        ),
                        pass: configService.getOrThrow<string>(
                            "NODEMAILER_PASSWORD",
                        ),
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

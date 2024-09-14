import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { DrizzleModule } from "../drizzle/drizzle.module";
import { ConfigService } from "@nestjs/config";
import { MailerModule } from "@nestjs-modules/mailer";

@Module({
    imports: [
        DrizzleModule,
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
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [],
})
export class AuthModule {}

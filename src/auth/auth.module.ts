import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { DrizzleModule } from "../drizzle/drizzle.module";
import { ConfigService } from "@nestjs/config";

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
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [],
})
export class AuthModule {}

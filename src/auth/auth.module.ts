import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { DrizzleModule } from "../drizzle/drizzle.module";

@Module({
    imports: [
        DrizzleModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: "1h" },
        }),
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [],
})
export class AuthModule {}

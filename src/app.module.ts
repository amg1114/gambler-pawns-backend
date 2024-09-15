import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { AuthModule } from "./auth/auth.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AssetsModule } from './assets/assets.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV.trim()}`,
        }),
        DrizzleModule,
        AuthModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "..", "public"),
        }),
        AssetsModule,
    ],
})
export class AppModule {}

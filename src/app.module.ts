import { Module } from "@nestjs/common";

// config
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSourceConfig } from "./config/db/database.provider";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

// Feature modules
import { AuthModule } from "./modules/auth/auth.module";
import { ChessModule } from "./modules/chess/chess.module";
import { AssetsModule } from "./modules/assets/assets.module";
import { UserModule } from "./modules/user/user.module";
import { NotificationsModule } from "./modules/notification/notifications.module";
import { PuzzleModule } from "./modules/puzzle/puzzle.module";
import { StoreModule } from "./modules/store/store.module";
import { ClubModule } from "./modules/club/club.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV.trim()}`,
        }),
        TypeOrmModule.forRoot({
            ...DataSourceConfig,
            autoLoadEntities: true,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "..", "public"),
        }),
        AuthModule,
        ChessModule,
        AssetsModule,
        UserModule,
        NotificationsModule,
        PuzzleModule,
        StoreModule,
        ClubModule,
    ],
})
export class AppModule {}

import { Module } from "@nestjs/common";

// config
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSourceConfig } from "./config/db/database.provider";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

// Feature modules
import { AuthModule } from "./auth/auth.module";
import { ChessModule } from "./chess/chess.module";
import { AssetsModule } from "./assets/assets.module";
import { UserModule } from "./user/user.module";
import { NotificationsModule } from "./notification/notifications.module";
import { PuzzleModule } from "./puzzle/puzzle.module";
import { StoreModule } from "./store/store.module";
import { ClubModule } from "./club/club.module";

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

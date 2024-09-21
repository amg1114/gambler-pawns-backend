import { ConfigModule, ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

ConfigModule.forRoot({
    envFilePath: [`.env.${process.env.NODE_ENV.trim()}`],
    isGlobal: false,
});
const configService = new ConfigService();

const DEV_POOL = {
    host: configService.getOrThrow("LOCALDB_HOST"),
    port: +configService.getOrThrow("LOCALDB_PORT"),
    username: configService.getOrThrow("LOCALDB_USER"),
    password: configService.getOrThrow("LOCALDB_PASSWORD"),
    database: configService.getOrThrow("LOCALDB_NAME"),
    logging: true,
    synchronize: true,
};

const PROD_POOL = {
    url: configService.getOrThrow("POSTGRES_URL"),
    logging: false,
    synchronize: false,
    extra: {
        ssl: true,
    },
};

const POOL = process.env.NODE_ENV === "production" ? PROD_POOL : DEV_POOL;

export const DataSourceConfig: DataSourceOptions = {
    type: "postgres",
    ...POOL,
    migrationsRun: false,
    entities: [__dirname + "/../../**/*.entity{.ts,.js}"],
    migrations: [__dirname + "/../../migrations/*{.ts,.js}"],
    namingStrategy: new SnakeNamingStrategy(),
};

export const AppDataSource: DataSource = new DataSource(DataSourceConfig);

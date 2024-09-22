import { ConfigModule, ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

ConfigModule.forRoot({
    envFilePath: [`.env.${process.env.NODE_ENV.trim()}`],
    isGlobal: false,
});
const configService = new ConfigService();

function getPoolConfig() {
    if (process.env.NODE_ENV === "dev") {
        return {
            host: configService.getOrThrow("LOCALDB_HOST"),
            port: +configService.getOrThrow("LOCALDB_PORT"),
            username: configService.getOrThrow("LOCALDB_USER"),
            password: configService.getOrThrow("LOCALDB_PASSWORD"),
            database: configService.getOrThrow("LOCALDB_NAME"),
            logging: true,
            synchronize: true,
        };
    } else {
        return {
            host: configService.getOrThrow("DBHOST_HOST"),
            port: +configService.getOrThrow("DBHOST_PORT"),
            username: configService.getOrThrow("DBHOST_USER"),
            password: configService.getOrThrow("DBHOST_PASSWORD"),
            database: configService.getOrThrow("DBHOST_NAME"),
            logging: false,
            synchronize: false,
        };
    }
}

export const DataSourceConfig: DataSourceOptions = {
    type: "postgres",
    ...getPoolConfig(),
    migrationsRun: true,
    entities: [__dirname + "/../../**/*.entity{.ts,.js}"],
    migrations: [__dirname + "/../../migrations/*{.ts,.js}"],
    namingStrategy: new SnakeNamingStrategy(),
};

export const AppDataSource: DataSource = new DataSource(DataSourceConfig);

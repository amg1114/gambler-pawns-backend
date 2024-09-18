import { ConfigModule, ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

ConfigModule.forRoot();
const configService = new ConfigService();

let poolOptions = undefined;

if (configService.getOrThrow<string>("NODE_ENV").trim() === "dev") {
    poolOptions = {
        host: configService.getOrThrow("LOCALDB_HOST"),
        port: configService.getOrThrow("LOCALDB_PORT"),
        database: configService.getOrThrow("LOCALDB_NAME"),
        username: configService.getOrThrow("LOCALDB_USER"),
        password: configService.getOrThrow("LOCALDB_PASSWORD"),
    };
} else {
    poolOptions = {
        url: configService.getOrThrow("POSTGRES_URL"),
        extra: {
            ssl: true,
        },
    };
}

export const DataSourceConfig: DataSourceOptions = {
    type: "postgres",
    // connection options depending NODE_ENV
    ...poolOptions,
    // in generated sql code table names will be snake_case
    namingStrategy: new SnakeNamingStrategy(),
    entities: [__dirname + "/../**/**/*.entity{.ts,.js}"],
    migrations: [__dirname + "/../migrations/*{.ts,.js}"],
    synchronize: true,
    migrationsRun: true,
    logging: false,
};

export const AppDataSource: DataSource = new DataSource(DataSourceConfig);

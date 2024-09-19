import { ConfigModule, ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

ConfigModule.forRoot({
    envFilePath: [`.env.${process.env.NODE_ENV.trim()}`],
    isGlobal: false,
});
const configService = new ConfigService();

const migrationConfig = {
    migrationsTableName: "migrations_typeorm",
    migrations: ["dist/migrations/*{.ts,.js}"],
    cli: {
        migrationsDir: "src/migrations",
    },
    migrationsRun: true,
};

const prodPoolOptions = {
    url: configService.getOrThrow("POSTGRES_URL"),
    extra: {
        ssl: true,
    },
    synchronize: false,
    logging: false,
    ...migrationConfig,
};

const devPoolOptions = {
    host: configService.getOrThrow("LOCALDB_HOST"),
    port: configService.getOrThrow("LOCALDB_PORT"),
    database: configService.getOrThrow("LOCALDB_NAME"),
    username: configService.getOrThrow("LOCALDB_USER"),
    password: configService.getOrThrow("LOCALDB_PASSWORD"),
    logging: true,
    synchronize: true,
    ...migrationConfig,
};

const poolOptions =
    configService.getOrThrow<string>("NODE_ENV").trim() === "dev"
        ? devPoolOptions
        : prodPoolOptions;

export const DataSourceConfig: DataSourceOptions = {
    type: "postgres",
    // connection options depending NODE_ENV
    ...poolOptions,
    // in generated sql code table names will be snake_case
    namingStrategy: new SnakeNamingStrategy(),
    entities: [__dirname + "/../**/**/*.entity{.ts,.js}"],
};

export const AppDataSource: DataSource = new DataSource(DataSourceConfig);

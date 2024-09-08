import { ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const DRIZZLE = Symbol("DRIZZLE-CONNECTION");
@Module({
    providers: [
        {
            provide: DRIZZLE,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                let pool = undefined;
                if (configService.get<string>("NODE_ENV").trim() === "dev") {
                    pool = new Pool({
                        user: configService.get<string>("LOCALDB_USER"),
                        host: configService.get<string>("LOCALDB_HOST"),
                        database: configService.get<string>("LOCALDB_NAME"),
                        password: configService.get<string>("LOCALDB_PASSWORD"),
                        port: configService.get<number>("LOCALDB_PORT"),
                    });
                } else {
                    pool = new Pool({
                        connectionString: configService.get("DATABASE_URL"),
                        ssl: true,
                    });
                }
                return drizzle(pool, { schema }) as NodePgDatabase<
                    typeof schema
                >;
            },
        },
    ],
    exports: [DRIZZLE],
})
export class DrizzleModule {}

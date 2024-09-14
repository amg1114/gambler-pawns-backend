import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { ConfigService } from "@nestjs/config";

export const DrizzleAsyncProvider = Symbol("DRIZZLE-CONNECTION");

export const drizzleProvider = [
    {
        provide: DrizzleAsyncProvider,
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

            return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
        },
    },
];
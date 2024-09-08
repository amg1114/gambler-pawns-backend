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
                const databaseUrl = configService.get("DATABASE_URL");

                let pool = undefined;
                if (process.env.NODE_ENV === "dev") {
                    pool = new Pool({
                        user: process.env.LOCALDB_USER,
                        host: process.env.LOCALDB_HOST,
                        database: process.env.LOCALDB_NAME,
                        password: process.env.LOCALDB_PASSWORD,
                        port: parseInt(process.env.LOCALDB_PORT),
                    });
                } else {
                    pool = new Pool({
                        connectionString: databaseUrl,
                        ssl: false,
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

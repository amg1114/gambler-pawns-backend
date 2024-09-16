import { Module } from "@nestjs/common";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";
import { DrizzleModule } from "src/drizzle/drizzle.module";

@Module({
    controllers: [AssetsController],
    providers: [AssetsService],
    imports: [DrizzleModule],
})
export class AssetsModule {}

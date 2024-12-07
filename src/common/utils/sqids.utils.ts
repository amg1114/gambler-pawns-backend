import Sqids from "sqids";
import { ConfigService } from "@nestjs/config";

export class SqidsUtils {
    private static sqids: Sqids;

    static initialize(configService: ConfigService) {
        this.sqids = new Sqids({
            minLength: 4,
            alphabet: configService.getOrThrow<string>("ALPHABET"),
        });
    }

    static encodeGameId(gameId: number): string {
        return this.sqids.encode([gameId]);
    }

    static decodeGameId(encodedId: string): number {
        return this.sqids.decode(encodedId)[0];
    }
}

import { ApiProperty } from "@nestjs/swagger";
import { IsObject } from "class-validator";
import { Game } from "src/modules/chess/entities/game";

export class RewatchGameResponse200Dto {
    @IsObject()
    @ApiProperty({
        //TODO: Improve example with filled data
        example: {
            gameId: 1,
            gameTimestamp: null,
            pgn: "",
            winner: null,
            whitesPlayerTime: null,
            blacksPlayerTime: null,
            eloWhitesBeforeGame: null,
            eloWhitesAfterGame: null,
            eloBlacksBeforeGame: null,
            eloBlacksAfterGame: null,
            resultType: null,
            typePairing: null,
            gameMode: {
                gameModeId: 7,
                mode: "Arcade",
            },
        },
    })
    data: Game;
}

export class RewatchGameResponse400Dto {
    @IsObject()
    @ApiProperty({
        example: {
            message: ["encodedId must be longer than or equal to 4 characters"],
            error: "BadRequestException",
        },
    })
    data: { message: string[]; error: string };
}

export class RewatchGameResponse404Dto {
    @IsObject()
    @ApiProperty({
        example: {
            message: ["Game not found"],
            error: "NotFoundException",
        },
    })
    data: { message: string[]; error: string };
}

export class RewatchGameResponse406Dto {
    @IsObject()
    @ApiProperty({
        example: {
            message: ["Invalid ID"],
            error: "NotAcceptableException",
        },
    })
    data: { message: string[]; error: string };
}

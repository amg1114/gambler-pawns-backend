import { ApiProperty } from "@nestjs/swagger";
import { Game } from "src/modules/chess/entities/game";

export class RewatchGameResponse200Dto {
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

            whitesPlayer: {
                userId: 101,
                nickname: "whitePlayer",
                email: "whiteplayer@example.com",
                dateOfBirth: "1990-01-01",
                countryCode: "US",
                aboutText: "Loves playing chess.",
                eloRapid: 1600,
                eloBlitz: 1550,
                eloBullet: 1500,
                eloArcade: 1400,
                currentCoins: 200,
                acumulatedAllTimeCoins: 500,
                nPuzzlesSolved: 50,
                streakDays: 10,
                isDeleted: false,
                userAvatarImg: {
                    userAvatarImgId: 1,
                    fileName: "avatar1.png",
                },
            },
            blacksPlayer: {
                userId: 102,
                nickname: "blackPlayer",
                email: "blackplayer@example.com",
                dateOfBirth: "1985-05-15",
                countryCode: "UK",
                aboutText: "Chess enthusiast.",
                eloRapid: 1650,
                eloBlitz: 1600,
                eloBullet: 1550,
                eloArcade: 1500,
                currentCoins: 300,
                acumulatedAllTimeCoins: 700,
                nPuzzlesSolved: 75,
                streakDays: 15,
                isDeleted: false,
                userAvatarImg: {
                    userAvatarImgId: 2,
                    fileName: "avatar2.png",
                },
            },
        },
    })
    data: Game;
}

export class RewatchGameResponse400Dto {
    @ApiProperty({
        example: {
            message: ["encodedId must be longer than or equal to 4 characters"],
            error: "BadRequestException",
        },
    })
    data: { message: string[]; error: string };
}

export class RewatchGameResponse404Dto {
    @ApiProperty({
        example: {
            message: ["Game not found"],
            error: "NotFoundException",
        },
    })
    data: { message: string[]; error: string };
}

export class RewatchGameResponse406Dto {
    @ApiProperty({
        example: {
            message: ["Invalid ID"],
            error: "NotAcceptableException",
        },
    })
    data: { message: string[]; error: string };
}

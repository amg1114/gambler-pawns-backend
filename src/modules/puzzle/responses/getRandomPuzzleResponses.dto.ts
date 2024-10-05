import { ApiProperty } from "@nestjs/swagger";

export class GetRandomPuzzleResponses200Dto {
    @ApiProperty({
        example: {
            lichessId: "uflXE",
            fen: "5k2/1p2n3/1B1pP1p1/1p4K1/7P/2P5/8/8 b - - 2 40",
            solution: "f8g7 b6c7 d6d5 c7e5",
            rating: 2970,
            popularity: 93,
        },
    })
    data: {
        lichessId: string;
        fen: string;
        solution: string;
        rating: number;
        popularity: number;
    };
}

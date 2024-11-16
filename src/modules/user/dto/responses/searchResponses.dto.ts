import { ApiProperty } from "@nestjs/swagger";

export class SearchReponse200 {
    @ApiProperty({
        example: [
            {
                userId: 1,
                nickname: "John Doe",
                userAvatarImg: {
                    userAvatarImgId: 1,
                },
                isFriend: true,
            },
            {
                userId: 2,
                nickname: "Test",
                userAvatarImg: {
                    userAvatarImgId: 5,
                },
                isFriend: false,
            },
        ],
    })
    data: [
        {
            userId: number;
            nickname: string;
            userAvatarImg: {
                userAvatarImgId: number;
            };
            isFriend: boolean;
        },
    ];
}

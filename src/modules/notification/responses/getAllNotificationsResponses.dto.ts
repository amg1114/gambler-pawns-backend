import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/modules/user/entities/user.entity";

export class GetAllNotificationsResponse200Dto {
    @ApiProperty({
        example: [
            {
                notificationId: 11,
                type: "Wants to play with you",
                title: "New Game Invite",
                message: "has invited you to play a game!",
                actionLink1: null,
                actionText1: null,
                actionLink2: null,
                actionText2: null,
                isRead: false,
                timeStamp: "2024-11-21T03:43:24.217Z",
                userWhoReceive: {
                    userId: 4,
                    nickname: "Hola",
                    email: "example@example.com",
                    dateOfBirth: null,
                    countryCode: "co",
                    aboutText: "",
                    eloRapid: 1500,
                    eloBlitz: 1500,
                    eloBullet: 1500,
                    eloArcade: 1500,
                    currentCoins: 100,
                    acumulatedAllTimeCoins: 100,
                    nPuzzlesSolved: 0,
                    streakDays: 0,
                    isDeleted: false,
                    userAvatarImg: {
                        userAvatarImgId: 21,
                        fileName: "21.png",
                    },
                },
                userWhoSend: {
                    userId: 5,
                    nickname: "Hola2",
                    email: "example2@example.com",
                    dateOfBirth: null,
                    countryCode: "co",
                    aboutText: "",
                    eloRapid: 1500,
                    eloBlitz: 1500,
                    eloBullet: 1500,
                    eloArcade: 1500,
                    currentCoins: 100,
                    acumulatedAllTimeCoins: 100,
                    nPuzzlesSolved: 0,
                    streakDays: 0,
                    isDeleted: false,
                    userAvatarImg: {
                        userAvatarImgId: 6,
                        fileName: "6.png",
                    },
                },
            },
        ],
    })
    notifications: [
        {
            notificationId: number;
            type: string;
            title: string;
            message: string;
            actionLink1: string;
            actionText1: string;
            actionLink2: string;
            actionText2: string;
            isRead: boolean;
            timeStamp: string;
            userWhoReceive: User;
            userWhoSend: User;
        },
    ];
}

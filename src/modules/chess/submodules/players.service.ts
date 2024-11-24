import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/modules/user/entities/user.entity";
import { Repository } from "typeorm/repository/Repository";
import { WsException } from "@nestjs/websockets";
import { GameModeType } from "../entities/db/game.entity";
import { UserAvatarImg } from "src/modules/user/entities/userAvatar.entity";
import { randomInt } from "crypto";

export interface PlayerCandidateVerifiedRequestData {
    playerId: string;
    timeInMinutes: number;
    socketId: string;
    timeIncrementPerMoveSeconds: number;
    joinedAt: number;
}

export type PlayerCandidateVerifiedData = RegisteredPlayer | GuestPlayer;

export interface RegisteredPlayer {
    isGuest: boolean;
    elo: number;
    userInfo: Partial<User>;
}

export interface GuestPlayer {
    isGuest: boolean;
    elo: number;
    userInfo: {
        userId: string;
        nickname: string;
        aboutText: string;
        countryCode: string;
        userAvatarImg: UserAvatarImg;
    };
}

/**
 * Service to handle user verification
 */
@Injectable()
export class PlayersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserAvatarImg)
        private readonly userAvatarImg: Repository<UserAvatarImg>,
    ) {}

    async createPlayer(
        playerId: string,
        gameMode: GameModeType,
    ): Promise<PlayerCandidateVerifiedData> {
        if (this.isGuest(playerId)) {
            return this.createGuestPlayer(playerId);
        }

        return await this.verifyNonGuestPlayer(playerId, gameMode);
    }

    private isGuest(playerId: string) {
        return playerId.includes("guest");
    }

    private createGuestPlayer(playerId: string) {
        // TODO: cambiar esto luego
        const avatarId = randomInt(1, 26);

        return {
            isGuest: true,
            elo: 1200,
            userInfo: {
                userId: playerId,
                nickname: "Guest",
                aboutText: "Guest",
                countryCode: "Guest",
                userAvatarImg: {
                    userAvatarImgId: avatarId,
                    fileName: `${avatarId}.png`,
                },
            },
        };
    }

    private async verifyNonGuestPlayer(
        playerId: string,
        gameMode: GameModeType,
    ) {
        const user = await this.userRepository.findOneBy({
            userId: +playerId,
        });

        if (!user) {
            throw new WsException("This invalid playerId");
        }

        return {
            elo: this.setEloByModeForNonGuestPlayer(user, gameMode),
            isGuest: false,
            userInfo: user,
        };
    }

    public setEloByModeForNonGuestPlayer(user: User, gameMode: GameModeType) {
        const eloByMode = {
            rapid: user.eloRapid,
            blitz: user.eloBlitz,
            bullet: user.eloBullet,
            arcade: user.eloArcade,
        };
        return eloByMode[gameMode];
    }

    /** Trasnform players data in order to avoid sending undesired fileds like password and userId to client */
    public transforPlayerData(player: PlayerCandidateVerifiedData) {
        return {
            isGuest: player.isGuest,
            elo: player.elo,
            userInfo: {
                userId: player.userInfo.userId,
                nickname: player.userInfo.nickname,
                aboutText: player.userInfo.aboutText,
                countryCode: player.userInfo.countryCode,
                userAvatarImg: player.userInfo.userAvatarImg,
            },
        };
    }
}

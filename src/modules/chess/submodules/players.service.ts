import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/modules/user/entities/user.entity";
import { Repository } from "typeorm/repository/Repository";
import { WsException } from "@nestjs/websockets";
import { GameModeType } from "../entities/db/game.entity";
import { UserAvatarImg } from "src/modules/user/entities/userAvatar.entity";

export interface PlayerCandidateVerifiedRequestData {
    eloRating: number;
    playerId: string;
    initialTime: number;
    socketId: string;
    incrementTime: number;
    joinedAt: number;
}

export type PlayerCandidateVerifiedData = RegisteredPlayer | GuestPlayer;

export interface RegisteredPlayer {
    isGuest: boolean;
    elo: number;
    userInfo: User;
}

export interface GuestPlayer {
    isGuest: boolean;
    elo: number;
    userInfo: {
        userId: string;
        nickname: string;
        aboutText: string;
        countryCode: string;
        avatar: UserAvatarImg;
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
        player: PlayerCandidateVerifiedRequestData,
        gameMode: GameModeType,
    ): Promise<PlayerCandidateVerifiedData> {
        if (this.isGuest(player.playerId)) {
            return await this.createGuestPlayer(player.playerId);
        }

        return await this.verifyNonGuestPlayer(player, gameMode);
    }

    private isGuest(playerId: string) {
        return playerId.includes("guest");
    }

    private async createGuestPlayer(playerId: string) {
        return {
            isGuest: true,
            elo: 1200,
            userInfo: {
                userId: playerId,
                nickname: "Guest",
                aboutText: "Guest",
                countryCode: "Guest",
                avatar: await this.userAvatarImg.findOneBy({
                    userAvatarImgId: Math.random() * (25 - 1) + 1,
                }),
            },
        };
    }

    private async verifyNonGuestPlayer(
        player: PlayerCandidateVerifiedRequestData,
        gameMode: GameModeType,
    ) {
        const user = await this.userRepository.findOneBy({
            userId: +player.playerId,
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

    private setEloByModeForNonGuestPlayer(user: User, gameMode: GameModeType) {
        const eloByMode = {
            rapid: user.eloRapid,
            blitz: user.eloBlitz,
            bullet: user.eloBullet,
            arcade: user.eloArcade,
        };
        return eloByMode[gameMode];
    }
}

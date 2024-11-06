import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/modules/user/entities/user.entity";
import { Repository } from "typeorm/repository/Repository";
import { WsException } from "@nestjs/websockets";
import { GameModeType } from "../entities/db/game.entity";

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
    isGuest: false;
    userInfo: User;
}

export interface GuestPlayer {
    isGuest: true;
    userInfo: {
        playerId: string;
        nickname: string;
        aboutText: string;
        elo: number;
        countryCode: string;
        avatar: string;
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
    ) {}

    async createPlayer(
        player: PlayerCandidateVerifiedRequestData,
    ): Promise<PlayerCandidateVerifiedData> {
        if (this.isGuest(player.playerId)) {
            return this.createGuestPlayer(player.playerId);
        }

        return await this.verifyNonGuestPlayer(player);
    }

    private isGuest(playerId: string) {
        return playerId.includes("guest");
    }

    private createGuestPlayer(playerId: string) {
        return {
            isGuest: true,
            userInfo: {
                playerId: playerId,
                nickname: "Guest",
                aboutText: "Guest",
                elo: 1200,
                countryCode: "Guest",
                avatar: "Guest",
            },
        };
    }

    private async verifyNonGuestPlayer(
        player: PlayerCandidateVerifiedRequestData,
    ) {
        const user = await this.userRepository.findOneBy({
            userId: +player.playerId,
        });

        if (!user) {
            throw new WsException("This invalid playerId");
        }

        return {
            isGuest: false,
            userInfo: user,
        };
    }

    // private setEloByModeForNonGuestPlayer(user: User, gameMode: GameModeType) {
    //     const eloByMode = {
    //         rapid: user.eloRapid,
    //         blitz: user.eloBlitz,
    //         bullet: user.eloBullet,
    //         arcade: user.eloArcade,
    //     };

    //     return eloByMode[gameMode];
    // }
}

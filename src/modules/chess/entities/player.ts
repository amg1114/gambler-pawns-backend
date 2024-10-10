import { InjectRepository } from "@nestjs/typeorm";
import { WsException } from "@nestjs/websockets";
import { User } from "src/modules/user/entities/user.entity";
import { Repository } from "typeorm";
import { GameModeType } from "./db/game.entity";

export type SideType = "w" | "b";

export class GamePlayer {
    public playerId: string;
    public isGuest: boolean;
    public side: SideType;
    public time: number; // seconds
    public elo: number;
    public gameMode: GameModeType;
    // Only if user is not guest
    public user: User;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(playerId: string, side: SideType, gameMode: GameModeType) {
        this.playerId = playerId;
        this.isGuest = this.playerId.includes("guest");
        this.side = side;
        this.gameMode = gameMode;
        return await this.verifyNonGuestPlayer();
    }

    private async verifyNonGuestPlayer() {
        if (this.isGuest) return;

        // TODO: hacer una consulta personalizada para no traer todos los datos del usuario
        // solo traer los necesarios (los que muestra el rival en el figma game page)
        this.user = await this.userRepository.findOneBy({
            userId: +this.playerId,
        });

        if (!this.user) {
            throw new WsException("This invalid playerId");
        }
        this.setElo();
        return this;
    }

    private setElo() {
        if (this.isGuest) return;

        const eloByMode = {
            rapid: this.user.eloRapid,
            blitz: this.user.eloBlitz,
            bullet: this.user.eloBullet,
            arcade: this.user.eloArcade,
        };

        this.elo = eloByMode[this.gameMode];
    }
}

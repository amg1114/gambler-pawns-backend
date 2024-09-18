import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Check,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { GameMode } from "./gameMode.entity";

@Entity("game")
@Check(`whites_player_time >= 0 AND blacks_player_time >= 0`)
@Check(
    `elo_whites_before_game >= 0 AND elo_blacks_before_game >= 0 AND elo_whites_after_game >= 0 AND elo_blacks_after_game >= 0`,
)
export class Game {
    @PrimaryGeneratedColumn()
    gameId: number;

    @Column({ type: "timestamptz" })
    gameTimestamp: Date;

    @Column({ type: "text" })
    pgn: string;

    @ManyToOne(() => User)
    @JoinColumn()
    whitesPlayer: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: "fk_blacks_player_id" })
    blacksPlayer: User;

    @Column({ type: "enum", enum: ["White", "Black", "Draw"], nullable: true })
    winner: "White" | "Black" | "Draw";

    @Column({ type: "int" })
    whitesPlayerTime: number;

    @Column({ type: "int" })
    blacksPlayerTime: number;

    @Column({ type: "int" })
    eloWhitesBeforeGame: number;

    @Column({ type: "int" })
    eloBlacksBeforeGame: number;

    @Column({ type: "int" })
    eloWhitesAfterGame: number;

    @Column({ type: "int" })
    eloBlacksAfterGame: number;

    @ManyToOne(() => GameMode)
    @JoinColumn()
    gameMode: GameMode;

    @Column({
        type: "enum",
        enum: [
            "On Time",
            "Draw offer",
            "Abandon",
            "Resign",
            "Stalemate",
            "N Moves Rule",
            "Check Mate",
        ],
        nullable: true,
    })
    resultType: string;

    @Column({
        type: "enum",
        enum: ["Link Shared", "Friend Req", "Random Pairing"],
    })
    typePairing: string;
}

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Check,
    OneToMany,
    Index,
    Relation,
} from "typeorm";
import { User } from "../../../user/entities/user.entity";
import { GameWithArcadeModifiers } from "./gameWithArcadeModifiers.entity";

// reusable types / enums
export type GameWinner = "White" | "Black" | "Draw";
export type GameResultType =
    | "On Time"
    | "Draw offer"
    | "Abandon"
    | "Resign"
    | "Stalemate"
    | "N Moves Rule"
    | "Check Mate";
export type GameTypePairing = "Link Shared" | "Friend Req" | "Random Pairing";

export type GameModeType = "rapid" | "blitz" | "bullet" | "arcade";
export const gameModeEnum = ["rapid", "blitz", "bullet", "arcade"];

// db entity
@Entity("game")
@Check(`whites_player_time >= 0 AND blacks_player_time >= 0`)
@Check(
    `elo_whites_before_game >= 0 AND elo_whites_after_game >= 0 AND elo_whites_after_game >= 0 AND elo_blacks_after_game >= 0`,
)
export class Game {
    @PrimaryGeneratedColumn()
    gameId: number;

    @Column({ type: "timestamptz", nullable: true })
    gameTimestamp: Date | null;

    @Column({ type: "text" })
    pgn: string;

    @ManyToOne(() => User, { nullable: true, onUpdate: "CASCADE" })
    @Index("idx_game_whites_player_ids")
    whitesPlayer: Relation<User | null>;

    @ManyToOne(() => User, { nullable: true, onUpdate: "CASCADE" })
    @Index("idx_game_blacks_player_ids")
    blacksPlayer: Relation<User | null>;

    @Column({ type: "enum", enum: ["White", "Black", "Draw"], nullable: true })
    winner: GameWinner | null;

    @Column({ type: "int", nullable: true })
    whitesPlayerTime: number | null;

    @Column({ type: "int", nullable: true })
    blacksPlayerTime: number | null;

    @Column({ type: "int", nullable: true })
    eloWhitesBeforeGame: number | null;

    @Column({ type: "int", nullable: true })
    eloWhitesAfterGame: number | null;

    @Column({ type: "int", nullable: true })
    eloBlacksBeforeGame: number | null;

    @Column({ type: "int", nullable: true })
    eloBlacksAfterGame: number | null;

    // TODO: tuve que dejar el nullable en true pq la migracion me daba error
    // revisar porque
    @Column({ type: "enum", enum: gameModeEnum, nullable: true })
    gameMode: GameModeType;

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
    resultType: GameResultType | null;

    @Column({
        type: "enum",
        enum: ["Link Shared", "Friend Req", "Random Pairing"],
        nullable: true,
    })
    typePairing: GameTypePairing | null;

    @OneToMany(
        () => GameWithArcadeModifiers,
        (gameWithArcadeModifiers) => gameWithArcadeModifiers.game,
    )
    gameWithArcadeModifiers: Relation<GameWithArcadeModifiers[]>;
}

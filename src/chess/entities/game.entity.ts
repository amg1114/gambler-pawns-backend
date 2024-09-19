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
import { User } from "../../user/entities/user.entity";
import { GameMode } from "./gameMode.entity";
import { GameWithArcadeModifiers } from "./gameWithArcadeModifiers.entity";

@Entity("game")
@Check(`whitesPlayerTime >= 0 AND blacksPlayerTime >= 0`)
@Check(
    `eloWhitesBeforeGame >= 0 AND eloWhitesAfterGame >= 0 AND eloWhitesAfterGame >= 0 AND eloBlacksAfterGame >= 0`,
)
export class Game {
    @PrimaryGeneratedColumn()
    gameId: number;

    @Column({ type: "timestamptz" })
    gameTimestamp: Date;

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

    @ManyToOne(() => GameMode, { eager: true, onUpdate: "CASCADE" })
    gameMode: Relation<GameMode>;

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
    })
    typePairing: GameTypePairing;

    @OneToMany(
        () => GameWithArcadeModifiers,
        (gameWithArcadeModifiers) => gameWithArcadeModifiers.game,
    )
    gameWithArcadeModifiers: Relation<GameWithArcadeModifiers[]>;
}

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

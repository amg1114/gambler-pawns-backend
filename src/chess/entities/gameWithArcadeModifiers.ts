import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Game } from "./game.entity";
import { ArcadeModifiers } from "./arcadeModifier";

@Entity()
export class GameWithArcadeModifiers {
    @PrimaryColumn()
    fkGameId: number;

    @PrimaryColumn({ type: "smallint" })
    fkArcadeModifierId: number;

    @ManyToOne(() => Game)
    @JoinColumn()
    game: Game;

    @ManyToOne(() => ArcadeModifiers)
    @JoinColumn()
    arcadeModifier: ArcadeModifiers;
}

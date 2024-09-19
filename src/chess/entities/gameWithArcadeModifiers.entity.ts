import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./game.entity";
import { ArcadeModifiers } from "./arcadeModifier.entity";

@Entity()
export class GameWithArcadeModifiers {
    @PrimaryGeneratedColumn()
    gameWithArcadeModifiersId: number;

    @ManyToOne(() => Game, (game) => game.gameId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    game: Game;

    @ManyToOne(
        () => ArcadeModifiers,
        (ArcadeModifiers) => ArcadeModifiers.arcadeModifierId,
        {
            eager: true,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            nullable: false,
            orphanedRowAction: "delete",
        },
    )
    arcadeModifier: ArcadeModifiers;
}

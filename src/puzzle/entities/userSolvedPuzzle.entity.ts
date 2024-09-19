import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Puzzle } from "./puzzle.entity";

@Entity()
export class UserSolvedPuzzle {
    @PrimaryGeneratedColumn()
    userSolvedPuzzleId: number;

    @ManyToOne(() => User, (user) => user.userId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        // triggers the delete when the entity was removed from the order.details.
        orphanedRowAction: "delete",
    })
    user: User;

    @ManyToOne(() => Puzzle, (puzzle) => puzzle.puzzleId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    puzzle: Puzzle;

    @Column({ type: "timestamptz", default: () => "NOW()" })
    solvedTimestamp: Date;
}

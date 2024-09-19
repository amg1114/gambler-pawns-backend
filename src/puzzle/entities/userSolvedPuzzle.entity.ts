import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
} from "typeorm";
import { User } from "src/user/entities/user.entity";
import { Puzzle } from "./puzzle.entity";

@Entity()
export class UserSolvedPuzzle {
    @PrimaryGeneratedColumn()
    userSolvedPuzzleId: number;

    @ManyToOne(() => User, (user) => user.userId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    user: Relation<Promise<User>>;

    @ManyToOne(() => Puzzle, (puzzle) => puzzle.puzzleId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    puzzle: Relation<Promise<Puzzle>>;

    @Column({ type: "timestamptz", default: () => "NOW()" })
    solvedTimestamp: Date;
}

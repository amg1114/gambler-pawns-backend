import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Puzzle } from "./puzzle.entity";

@Entity()
export class UserSolvedPuzzle {
    @PrimaryColumn()
    fkUserId: number;

    @PrimaryColumn()
    fkPuzzleId: number;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;

    @ManyToOne(() => Puzzle)
    @JoinColumn()
    puzzle: Puzzle;

    @Column({ type: "timestamptz" })
    solvedTimestamp: Date;
}

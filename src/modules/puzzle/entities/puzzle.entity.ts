import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    Relation,
} from "typeorm";
import { UserSolvedPuzzle } from "./userSolvedPuzzle.entity";

//REF: https://database.lichess.org/#puzzles
@Entity()
export class Puzzle {
    @PrimaryGeneratedColumn()
    puzzleId: number;

    @Column({ type: "varchar", length: 5, unique: true })
    lichessId: string;

    @Column({ type: "text" })
    fen: string;

    // moves separated by space
    @Column({ type: "varchar", length: 255 })
    solution: string;

    @Column({ type: "smallint" })
    rating: number;

    @Column({ type: "smallint" })
    popularity: number;

    @OneToMany(
        () => UserSolvedPuzzle,
        (userSolvedPuzzle) => userSolvedPuzzle.puzzle,
    )
    userSolvedPuzzles: Relation<UserSolvedPuzzle[]>;
}

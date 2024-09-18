import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Puzzle {
    @PrimaryGeneratedColumn()
    puzzleId: number;

    @Column({ type: "timestamptz" })
    puzzleTimestamp: Date;

    @Column({ type: "text" })
    fen: string;

    @Column({ type: "int" })
    difficulty: number;

    @Column({ type: "varchar", length: 255 })
    solution: string;
}

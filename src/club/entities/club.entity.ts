import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "./../../user/entities/user.entity";

@Entity("clubs")
export class Club {
    @PrimaryGeneratedColumn()
    clubId: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "varchar", length: 255 })
    description: string;

    @Column({ type: "timestamptz" })
    creationTimestamp: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: "fk_club_creator_id" })
    creator: User;
}

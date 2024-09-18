import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Club } from "./club.entity";

@Entity()
export class ClubPost {
    @PrimaryGeneratedColumn()
    postId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "fk_user_id" })
    user: User;

    @ManyToOne(() => Club)
    @JoinColumn({ name: "fk_club_id" })
    club: Club;

    @Column({ type: "text" })
    content: string;

    @Column({ type: "timestamptz" })
    postTimestamp: Date;
}

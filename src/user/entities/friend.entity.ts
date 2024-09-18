import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Friend {
    @PrimaryGeneratedColumn()
    friendshipId: number;

    @ManyToOne(() => User)
    @JoinColumn()
    user1Id: User;

    @ManyToOne(() => User)
    @JoinColumn()
    user2Id: User;

    @Column({ type: "boolean", default: false })
    isAccepted: boolean;

    @Column({ type: "timestamptz" })
    friendshipRequestTimestamp: Date;

    @Column({ type: "timestamptz", nullable: true })
    friendshipAcceptedTimestamp: Date;
}

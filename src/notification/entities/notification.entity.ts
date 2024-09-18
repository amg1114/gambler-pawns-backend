import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    notificationId: number;

    @Column({ type: "timestamptz" })
    notificationTimestamp: Date;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;

    @Column({ type: "text" })
    message: string;

    @Column({ type: "boolean", default: false })
    isRead: boolean;
}

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Index,
    Relation,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { NotificationType } from "./notificationType.entity";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    notificationId: number;

    @ManyToOne(() => User, (userWhoSend) => userWhoSend.userId, {
        // when is null, it was send by the system
        nullable: true,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        orphanedRowAction: "delete",
    })
    userWhoSend: Relation<Promise<User>>;

    @ManyToOne(() => User, (userWhoReceive) => userWhoReceive.userId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    @Index("idx_notifications_user_id")
    userWhoReceive: Relation<Promise<User>>;

    @ManyToOne(
        () => NotificationType,
        (notificationType) => notificationType.notificationTypeId,
        {
            eager: true,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            nullable: false,
            orphanedRowAction: "delete",
        },
    )
    notificationType: Relation<NotificationType>;

    @Column()
    title: string;

    @Column({ type: "text" })
    message: string;

    @Column({ nullable: true })
    actionLink1: string;

    @Column({ nullable: true })
    actionText1: string;

    @Column({ nullable: true })
    actionLink2: string;

    @Column({ nullable: true })
    actionText2: string;

    @Column({ type: "boolean", default: false })
    isRead: boolean;

    @Column({ type: "timestamptz" })
    timeStamp: Date;
}

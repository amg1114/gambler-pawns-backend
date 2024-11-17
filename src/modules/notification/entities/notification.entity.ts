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
    userWhoSend: Relation<User>;

    @ManyToOne(() => User, (userWhoReceive) => userWhoReceive.userId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    @Index("idx_notifications_user_id")
    userWhoReceive: Relation<User>;

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

    @Column()
    actionLink1: string;

    @Column()
    actionText1: string;

    @Column()
    actionLink2: string;

    @Column()
    actionText2: string;

    @Column({ type: "boolean", default: false })
    isRead: boolean;

    @Column({ type: "timestamptz" })
    timeStamp: Date;
}

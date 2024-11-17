import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Index,
    Relation,
} from "typeorm";
import { User } from "../../user/entities/user.entity";

export const notificationTypes = {
    WANTS_TO_PLAY: "Wants to play with you",
    ACCEPTED_TO_PLAY: "Accepted to play with you",
    WANTS_TO_JOIN_CLUB: "Wants to join club",
    MADE_A_POST: "Made a post",
    REQUEST_TO_BE_FRIEND: "Request to be your friend",
    ACCEPTED_FRIEND_REQUEST: "Accepted your friend request",
    ADMIN_OF_CLUB: "You are admin of a club now",
    SYSTEM_NOTIFICATION: "System Notification",
} as const;

export type NotificationTypeType =
    (typeof notificationTypes)[keyof typeof notificationTypes];

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

    @Column({
        type: "enum",
        enum: Object.values(notificationTypes),
    })
    type: NotificationTypeType;

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

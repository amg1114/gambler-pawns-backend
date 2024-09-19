import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    JoinTable,
    ManyToMany,
    Index,
    Relation,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Club } from "./club.entity";

@Entity()
export class ClubPost {
    @PrimaryGeneratedColumn()
    postId: number;

    @ManyToOne(() => User, (user) => user.userId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    user: Relation<User>;

    @ManyToOne(() => Club, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    @JoinColumn()
    @Index("idx_club_posts_club_id")
    club: Relation<Club>;

    @Column({ type: "text", nullable: true })
    content: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    imgFileName: string;
    // img_id is the id of the image stored in firabase or other external service

    // TODO: implement trigger for data integrity
    @Column({ type: "smallint", default: 0 })
    totalLikes: number;

    @Column({ type: "timestamptz", default: () => "NOW()" })
    postTimestamp: Date;

    @ManyToMany(() => User, (user) => user.likes, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    @JoinTable()
    likes: Relation<User[]>;
}

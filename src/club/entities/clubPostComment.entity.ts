import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Index,
} from "typeorm";
import { User } from "./../../user/entities/user.entity";
import { ClubPost } from "./clubPost.entity";

@Entity()
export class ClubPostComment {
    @PrimaryGeneratedColumn()
    commentId: number;

    @ManyToOne(() => User, (user) => user.userId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    user: User;

    @ManyToOne(() => ClubPost, (clubPost) => clubPost.postId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    @Index("idx_comments_post_id")
    post: ClubPost;

    @Column({ type: "text" })
    content: string;

    @Column({ type: "timestamptz", default: () => "NOW()" })
    commentTimestamp: Date;
}

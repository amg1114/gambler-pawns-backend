import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Index,
    Relation,
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
    user: Relation<User>;

    @ManyToOne(() => ClubPost, (clubPost) => clubPost.postId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    @Index("idx_comments_post_id")
    post: Relation<ClubPost>;

    @Column({ type: "text" })
    content: string;

    @Column({ type: "timestamptz", default: () => "NOW()" })
    commentTimestamp: Date;
}

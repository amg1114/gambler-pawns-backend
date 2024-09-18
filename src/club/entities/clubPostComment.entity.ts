import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "./../../user/entities/user.entity";
import { ClubPost } from "./clubPost.entity";

@Entity()
export class ClubPostComment {
    @PrimaryGeneratedColumn()
    commentId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "fk_user_id" })
    user: User;

    @ManyToOne(() => ClubPost)
    @JoinColumn({ name: "fk_post_id" })
    post: ClubPost;

    @Column({ type: "text" })
    content: string;

    @Column({ type: "timestamptz" })
    commentTimestamp: Date;
}

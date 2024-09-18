import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./../../user/entities/user.entity";
import { ClubPost } from "./clubPost.entity";

@Entity()
export class ClubPostLike {
    @PrimaryColumn()
    fkUserId: number;

    @PrimaryColumn()
    fkPostId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "fk_user_id" })
    user: User;

    @ManyToOne(() => ClubPost)
    @JoinColumn({ name: "fk_post_id" })
    post: ClubPost;

    @Column({ type: "timestamptz" })
    like_timestamp: Date;
}

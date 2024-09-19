import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    Relation,
} from "typeorm";
import { UserInClub } from "./userInClub.entity";
import { ClubPost } from "./clubPost.entity";

@Entity("clubs")
export class Club {
    @PrimaryGeneratedColumn()
    clubId: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "varchar", length: 255 })
    description: string;

    // file name or id of image in firebase or other external service
    @Column({ type: "varchar", length: 255 })
    imgFileName: string;

    @Column({ type: "timestamptz", default: () => "NOW()" })
    creationTimestamp: Date;

    // -- many to many relations oneToMany Side
    @OneToMany(() => UserInClub, (clubMember) => clubMember.club)
    members: Relation<UserInClub[]>;

    @OneToMany(() => ClubPost, (clubPost) => clubPost.club)
    posts: Relation<ClubPost[]>;

    /*
    NOTE: Esto no se planteo pero es una idea interesante

    @ManyToOne(() => User)
    @JoinColumn({ name: "fk_club_creator_id" })
    creator: User;*/
}

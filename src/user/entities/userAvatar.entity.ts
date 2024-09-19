import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class UserAvatarImg {
    //NOTE: @ManyToOne is no required here
    //  neither bidirectional relationship
    // https://orkhan.gitbook.io/typeorm/docs/many-to-one-one-to-many-relations
    @PrimaryGeneratedColumn({ type: "smallint" })
    userAvatarImgId: number;

    // avatar images are stored in: public/user_avatars/<file_name>
    @Column()
    fileName: string;
}

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class UserAvatarImg {
    //NOTE: bidirectional relationship not neeeded
    @PrimaryGeneratedColumn({ type: "smallint" })
    userAvatarImgId: number;

    // avatar images are stored in: public/user_avatars/<file_name>
    @Column()
    fileName: string;
}

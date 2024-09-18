import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class UserAvatarImg {
    @PrimaryGeneratedColumn({ type: "smallint" })
    userAvatarImgId: number;

    @Column()
    fileName: string;
}

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Check,
} from "typeorm";
import { UserAvatarImg } from "./userAvatar.entity";

@Entity()
// TODO: review how this check constraint work when transpile to sql as snakeCase naming
// convention is set in the db config
@Check(`eloRapid >= 0 AND eloBlitz >= 0 AND eloBullet >= 0 AND eloArcade >= 0`)
@Check(`currentCoins >= 0 AND acumulatedAllTimeCoins >= 0`)
export class User {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column({ type: "varchar", length: 255, unique: true })
    nickname: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email: string;

    @Column({ type: "varchar", length: 255 })
    password: string;

    @Column({ type: "date", nullable: true })
    dateOfBirth: Date;

    @Column({ type: "varchar", length: 3 })
    countryCode: string;

    @Column({ type: "text" })
    aboutText: string;

    // TODO: review how bidirectional relationship works in typeorm
    @ManyToOne(
        () => UserAvatarImg,
        (fkUserAvatarImg) => fkUserAvatarImg.fileName,
        { eager: true },
    )
    @JoinColumn()
    fkUserAvatarImg: UserAvatarImg;

    @Column({ type: "int" })
    eloRapid: number;

    @Column({ type: "int" })
    eloBlitz: number;

    @Column({ type: "int" })
    eloBullet: number;

    @Column({ type: "int" })
    eloArcade: number;

    @Column({ type: "int" })
    currentCoins: number;

    @Column({ type: "int" })
    acumulatedAllTimeCoins: number;

    @Column({ type: "int", default: 0 })
    nPuzzlesSolved: number;

    @Column({ type: "smallint", default: 0 })
    streakDays: number;

    @Column({ type: "boolean", default: false })
    isDeleted: boolean;
}

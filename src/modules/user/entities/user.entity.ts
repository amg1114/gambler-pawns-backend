import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Check,
    OneToMany,
    ManyToMany,
    JoinTable,
    Index,
    Relation,
} from "typeorm";
import { UserAvatarImg } from "./userAvatar.entity";
import { UserSolvedPuzzle } from "../../puzzle/entities/userSolvedPuzzle.entity";
import { UserBoughtProduct } from "../../store/entities/userBoughtProduct.entity";
import { Game } from "../../chess/entities/db/game.entity";
import { Notification } from "../../notification/entities/notification.entity";
import { UserInClub } from "../../club/entities/userInClub.entity";
import { ClubPost } from "../../club/entities/clubPost.entity";
import { ClubPostComment } from "../../club/entities/clubPostComment.entity";
import { Exclude } from "class-transformer";

@Entity()
// NOTE: when using @Check constraint, you must use sanke case
@Check(
    `elo_rapid >= 0 AND elo_blitz >= 0 AND elo_bullet >= 0 AND elo_arcade >= 0`,
)
@Check(`current_coins >= 0 AND acumulated_all_time_coins >= 0`)
export class User {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column({ type: "varchar", length: 255, unique: true })
    @Index("idx_nickname")
    nickname: string;

    @Index("idx_email")
    @Column({ type: "varchar", length: 255, unique: true })
    email: string;

    @Column({ type: "varchar", length: 255, select: false })
    @Exclude()
    password: string;

    @Column({ type: "date", nullable: true })
    dateOfBirth: Date;

    @Column({ type: "varchar", length: 3 })
    countryCode: string;

    @Column({ type: "text" })
    aboutText: string;

    // NOTE: according to documentation I can omit @JoinColumn() in @ManyToOne
    //  https://orkhan.gitbook.io/typeorm/docs/many-to-one-one-to-many-relations
    @ManyToOne(
        () => UserAvatarImg,
        (userAvatarImg) => userAvatarImg.userAvatarImgId,
        {
            eager: true,
        },
    )
    userAvatarImg: Relation<UserAvatarImg>;

    @Column({ type: "int" })
    @Index("idx_elo_rapid")
    eloRapid: number;

    @Column({ type: "int" })
    @Index("idx_elo_blitz")
    eloBlitz: number;

    @Column({ type: "int" })
    @Index("idx_elo_bullet")
    eloBullet: number;

    @Column({ type: "int" })
    @Index("idx_elo_arcade")
    eloArcade: number;

    @Column({ type: "int" })
    currentCoins: number;

    @Column({ type: "int" })
    acumulatedAllTimeCoins: number;

    // TODO: implement trigger for data integrity
    @Column({ type: "int", default: 0 })
    nPuzzlesSolved: number;

    @Column({ type: "smallint", default: 0 })
    streakDays: number;

    @Column({ type: "boolean", default: false })
    isDeleted: boolean;

    // --- For Many to many relations with custom properties ---
    // https://orkhan.gitbook.io/typeorm/docs/many-to-many-relations#many-to-many-relations-with-custom-properties
    @ManyToMany(() => User, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinTable()
    friends: Relation<User[]>;

    @OneToMany(() => UserSolvedPuzzle, (puzzlesSolved) => puzzlesSolved.user)
    puzzlesSolved: Relation<UserSolvedPuzzle[]>;

    @OneToMany(
        () => UserBoughtProduct,
        (userBoughtProducts) => userBoughtProducts.user,
    )
    userBoughtProducts: Relation<UserBoughtProduct[]>;

    @OneToMany(() => Game, (gamesAsBlack) => gamesAsBlack.whitesPlayer)
    gamesAsWhite: Relation<Game[]>;

    @OneToMany(() => Game, (gamesAsBlack) => gamesAsBlack.blacksPlayer)
    gamesAsBlack: Relation<Game[]>;

    @OneToMany(
        () => Notification,
        (notificationsSent) => notificationsSent.userWhoSend,
    )
    notificationsSent: Relation<Notification[]>;

    @OneToMany(
        () => Notification,
        (notificationsReceived) => notificationsReceived.userWhoReceive,
    )
    notificationsReceived: Relation<Notification[]>;

    @OneToMany(() => UserInClub, (clubs) => clubs.user)
    clubs: Relation<UserInClub[]>;

    @OneToMany(() => ClubPost, (posts) => posts.user)
    posts: Relation<ClubPost[]>;

    @ManyToMany(() => ClubPost, (clubPost) => clubPost.likes)
    likes: Relation<ClubPost[]>;

    @OneToMany(
        () => ClubPostComment,
        (clubPostComments) => clubPostComments.user,
    )
    clubPostComments: Relation<ClubPostComment[]>;
}

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
import { UserSolvedPuzzle } from "src/puzzle/entities/userSolvedPuzzle.entity";
import { UserBoughtProduct } from "src/store/entities/userBoughtProduct.entity";
import { Game } from "src/chess/entities/game.entity";
import { Notification } from "src/notification/entities/notification.entity";
import { UserInClub } from "src/club/entities/userInClub.entity";
import { ClubPost } from "src/club/entities/clubPost.entity";
import { ClubPostComment } from "src/club/entities/clubPostComment.entity";

@Entity()
// TODO: review how this check constraint work when transpile to sql as snakeCase naming
// convention is set in the db config
@Check(`eloRapid >= 0 AND eloBlitz >= 0 AND eloBullet >= 0 AND eloArcade >= 0`)
@Check(`currentCoins >= 0 AND acumulatedAllTimeCoins >= 0`)
export class User {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column({ type: "varchar", length: 255, unique: true })
    @Index("idx_nickname")
    nickname: string;

    @Index("idx_email")
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

    // NOTE: according to documentation I can omit @JoinColumn() in @ManyToOne
    //  https://orkhan.gitbook.io/typeorm/docs/many-to-one-one-to-many-relations
    @ManyToOne(() => UserAvatarImg, (userAvatarImg) => userAvatarImg.fileName, {
        eager: true,
    })
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
    puzzlesSolved: Relation<Promise<UserSolvedPuzzle[]>>;

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
    notificationsSent: Relation<Promise<Notification[]>>;

    @OneToMany(
        () => Notification,
        (notificationsReceived) => notificationsReceived.userWhoReceive,
    )
    notificationsReceived: Relation<Promise<Notification[]>>;

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

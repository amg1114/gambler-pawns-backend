import {
    Column,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
} from "typeorm";
import { User } from "./../../user/entities/user.entity";
import { Club } from "./club.entity";

export type ClubRole = "ADMIN" | "MEMBER";

@Entity()
export class UserInClub {
    @PrimaryGeneratedColumn()
    userInClubId: number;

    @ManyToOne(() => User, (user) => user.userId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    @Index("idx_users_clubs_user_id")
    user: Relation<User>;

    @ManyToOne(() => Club, (club) => club.clubId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    @Index("idx_members_club_id")
    club: Relation<Club>;

    @Column({ type: "timestamptz", default: () => "NOW()" })
    joinTimestamp: Date;

    @Column({ type: "enum", enum: ["ADMIN", "MEMBER"], default: "MEMBER" })
    role: ClubRole;
}

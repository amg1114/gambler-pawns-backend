import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./../../user/entities/user.entity";
import { Club } from "./club.entity";

@Entity()
export class UserInClub {
    @PrimaryColumn()
    fkUserId: number;

    @PrimaryColumn()
    fkClubId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "fk_user_id" })
    user: User;

    @ManyToOne(() => Club)
    @JoinColumn({ name: "fk_club_id" })
    club: Club;

    @Column({ type: "timestamptz" })
    joinTimestamp: Date;

    @Column({ type: "boolean", default: false })
    isAdmin: boolean;
}

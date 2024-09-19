import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class NotificationType {
    @PrimaryGeneratedColumn()
    notificationTypeId: number;

    @Column()
    type: string;
}

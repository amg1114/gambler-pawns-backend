import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ArcadeModifiers {
    @PrimaryGeneratedColumn({ type: "smallint" })
    arcadeModifierId: number;

    @Column({ type: "varchar", length: 255 })
    modifierName: string;
}

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class GameMode {
    @PrimaryGeneratedColumn({ type: "smallint" })
    gameModeId: number;

    @Column({ type: "varchar", length: 255 })
    mode: string;

    // TODO: duda, aqui necesitamos una relacion bidireaccional?  @OneToMany
}

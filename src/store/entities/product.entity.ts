import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    Check,
    Relation,
} from "typeorm";
import { UserBoughtProduct } from "./userBoughtProduct.entity";

@Check(`coinsCost >= 0`)
@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    productId: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({
        type: "enum",
        enum: ["Board", "Pieces", "Board and Pieces", "Reaction"],
    })
    type: ProductType;

    @Column({ type: "varchar", length: 255 })
    description: string;

    @Column({ type: "int" })
    coinsCost: number;

    @Column({ type: "json" })
    content: ProductContent;

    @OneToMany(
        () => UserBoughtProduct,
        (userBoughtProduct) => userBoughtProduct.product,
    )
    userBroughtProducts: Relation<UserBoughtProduct[]>;
}

export interface ProductContent {
    dark_squares_color?: string;
    light_squares_color?: string;
    pieces?: string[];
}

export type ProductType = "Board" | "Pieces" | "Board and Pieces" | "Reaction";

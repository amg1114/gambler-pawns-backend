import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Product } from "./product.entity";

@Entity()
export class UserBoughtProduct {
    @PrimaryColumn()
    fkUserId: number;

    @PrimaryColumn()
    fkProductId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "fk_user_id" })
    user: User;

    @ManyToOne(() => Product)
    @JoinColumn({ name: "fk_product_id" })
    product: Product;

    @Column({ type: "timestamptz" })
    purchaseTimestamp: Date;
}

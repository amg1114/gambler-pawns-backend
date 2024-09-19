import {
    Column,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Product } from "./product.entity";

@Index("idx_user_bought_products_user_id", ["user", "product"])
@Entity()
export class UserBoughtProduct {
    @PrimaryGeneratedColumn()
    userBoughtProductId: number;

    @ManyToOne(() => User, (user) => user.userId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
    })
    user: Relation<User>;

    @ManyToOne(() => Product, (product) => product.productId, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        nullable: false,
        orphanedRowAction: "delete",
        // assuming when dont have a lot products
        eager: true,
    })
    product: Relation<Product>;

    @Column({ type: "timestamptz", default: () => "NOW()" })
    purchaseTimestamp: Date;
}

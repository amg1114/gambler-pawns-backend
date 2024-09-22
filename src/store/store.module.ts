import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { UserBoughtProduct } from "./entities/userBoughtProduct.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Product, UserBoughtProduct])],
})
export class StoreModule {}

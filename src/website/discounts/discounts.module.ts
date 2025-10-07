import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DiscountsService } from "./discounts.service";
import { DiscountsController } from "./discounts.controller";
import { Discount } from "../../common/entities/discount.entity";
import { Product } from "../../common/entities/product.entity";
import { Collection } from "../../common/entities/collection.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Discount, Product, Collection])],
  controllers: [DiscountsController],
  providers: [DiscountsService],
  exports: [DiscountsService],
})
export class DiscountsModule { }

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { Order } from "../../common/entities/order.entity";
import { Discount } from "../../common/entities/discount.entity";
import { Product } from "../../common/entities/product.entity";
import { ProductVariant } from "../../common/entities/product-variant.entity";
import { User } from "../../common/entities/user.entity";
import { OrderProduct } from "../../common/entities/order-products.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderProduct,
      Discount,
      Product,
      ProductVariant,
      User,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule { }

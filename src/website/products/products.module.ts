import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { ProductVariantsService } from "./product-variants.service";
import { ProductVariantsController } from "./product-variants.controller";
import { Product } from "../../common/entities/product.entity";
import { ProductVariant } from "../../common/entities/product-variant.entity";
import { Collection } from "../../common/entities/collection.entity";
import { Type as ProductType } from "../../common/entities/type.entity";
import { File } from "../../common/entities/file.entity";
import { Amenity } from "../../common/entities/amenity.entity";
import { ProductCommission } from "../../common/entities/product-commission.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      ProductCommission,
      Collection,
      Amenity,
      ProductType,
      File,
    ]),
  ],
  controllers: [ProductsController, ProductVariantsController],
  providers: [ProductsService, ProductVariantsService],
  exports: [ProductsService, ProductVariantsService],
})
export class ProductsModule { }

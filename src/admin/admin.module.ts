import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";
import { RolesModule } from "./roles/roles.module";
import { PermissionsModule } from "./permissions/permissions.module";
import { CollectionsModule } from "./collections/collections.module";
import { TypesModule } from "./types/types.module";
import { BlogsModule } from "./blogs/blogs.module";
import { PagesModule } from "./pages/pages.module";
import { FilesModule } from "./files/files.module";
import { BannersModule } from "./banners/banners.module";
import { EnquiriesModule } from "./enquiries/enquiries.module";
import { AmenitiesModule } from "./amenities/amenities.module";
import { AmenityCategoriesModule } from "./amenity-categories/amenity-categories.module";
import { TestimonialsModule } from "./testimonials/testimonials.module";
import { DiscountsModule } from "./discounts/discounts.module";
import { OrdersModule } from "./orders/orders.module";
import { BlogCategoriesModule } from "./blog-categories/blog-categories.module";
import { SharedModule } from "../common/shared.module";

@Module({
  imports: [
    SharedModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    RolesModule,
    PermissionsModule,
    CollectionsModule,
    BlogsModule,
    BlogCategoriesModule,
    PagesModule,
    TypesModule,
    FilesModule,
    BannersModule,
    EnquiriesModule,
    TestimonialsModule,
    DiscountsModule,
    OrdersModule,
    AmenitiesModule,
    AmenityCategoriesModule,
  ],
})
export class AdminModule { }

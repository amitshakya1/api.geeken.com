import { Module } from "@nestjs/common";

// Import website modules
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";
import { BlogsModule } from "./blogs/blogs.module";
import { PagesModule } from "./pages/pages.module";
import { CollectionsModule } from "./collections/collections.module";
import { DiscountsModule } from "./discounts/discounts.module";
import { EnquiriesModule } from "./enquiries/enquiries.module";
import { OrdersModule } from "./orders/orders.module";
import { SharedModule } from "../common/shared.module";
import { BannersModule } from "./banners/banners.module";
import { TestimonialsModule } from "./testimonials/testimonials.module";

@Module({
    imports: [
        SharedModule,
        // Website-specific modules
        AuthModule,
        UsersModule,
        ProductsModule,
        BlogsModule,
        PagesModule,
        CollectionsModule,
        DiscountsModule,
        EnquiriesModule,
        OrdersModule,
        BannersModule,
        TestimonialsModule,
    ],
})
export class WebsiteModule { }

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

// Import all entities
import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { Product } from "./entities/product.entity";
import { ProductVariant } from "./entities/product-variant.entity";
import { Blog } from "./entities/blog.entity";
import { Page } from "./entities/page.entity";
import { UserRole } from "./entities/user-role.entity";
import { UserPermission } from "./entities/user-permission.entity";
import { RolePermission } from "./entities/role-permission.entity";
import { Type as ProductType } from "./entities/type.entity";
import { File } from "./entities/file.entity";
import { Banner } from "./entities/banner.entity";
import { Enquiry } from "./entities/enquiry.entity";
import { Testimonial } from "./entities/testimonial.entity";
import { Discount } from "./entities/discount.entity";
import { Order } from "./entities/order.entity";
import { Amenity } from "./entities/amenity.entity";
import { AmenityCategory } from "./entities/amenity-category.entity";
import { EnquiryReply } from "./entities/enquiry-reply.entity";
import { CompanyAddress } from "./entities/company-address.entity";
import { CompanyBankAccount } from "./entities/company-bank-account.entity";
import { UserCompany } from "./entities/user-company.entity";
import { UserDocument } from "./entities/user-document.entity";
import { CompanyDocument } from "./entities/company-document.entity";
import { ProductCommission } from "./entities/product-commission.entity";
import { OrderProduct } from "./entities/order-products.entity";
import { BlogCategory } from "./entities/blog-category.entity";

import { throttlerConfig } from "./config/throttler.config";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ThrottlerModule.forRoot(throttlerConfig),
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get("DATABASE_HOST") || "localhost",
                port: configService.get("DATABASE_PORT") || 5432,
                username: configService.get("DATABASE_USERNAME"),
                password: configService.get("DATABASE_PASSWORD"),
                database: configService.get("DATABASE_NAME"),
                entities: [
                    User,
                    CompanyAddress,
                    CompanyBankAccount,
                    CompanyDocument,
                    UserCompany,
                    UserDocument,
                    User,
                    Role,
                    Permission,
                    Product,
                    ProductVariant,
                    UserRole,
                    UserPermission,
                    RolePermission,
                    Blog,
                    BlogCategory,
                    Page,
                    ProductType,
                    ProductCommission,
                    File,
                    Banner,
                    Enquiry,
                    EnquiryReply,
                    Testimonial,
                    Discount,
                    Amenity,
                    AmenityCategory,
                    Order,
                    OrderProduct,
                ],
                synchronize: false,
                logging: process.env.NODE_ENV === "development",
                autoLoadEntities: true,
                migrationsRun: false,
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
    exports: [ConfigModule, ThrottlerModule, TypeOrmModule],
})
export class SharedModule { }

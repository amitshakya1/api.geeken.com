import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import all entities manually (DO NOT use glob here)
import { User } from "../common/entities/user.entity";
import { UserCreationAudit } from "../common/entities/user-creation-audit.entity";
import { Role } from "../common/entities/role.entity";
import { Permission } from "../common/entities/permission.entity";
import { Product } from "../common/entities/product.entity";
import { UserRole } from "../common/entities/user-role.entity";
import { UserPermission } from "../common/entities/user-permission.entity";
import { RolePermission } from "../common/entities/role-permission.entity";
import { Collection } from "../common/entities/collection.entity";
import { Blog } from "../common/entities/blog.entity";
import { File } from "../common/entities/file.entity";
import { Page } from "../common/entities/page.entity";
import { Banner } from "../common/entities/banner.entity";
import { Testimonial } from "../common/entities/testimonial.entity";
import { Enquiry } from "../common/entities/enquiry.entity";
import { ProductVariant } from "../common/entities/product-variant.entity";
import { Discount } from "../common/entities/discount.entity";
import { Type as ProductType } from "../common/entities/type.entity";
import { Amenity } from "../common/entities/amenity.entity";
import { Order } from "../common/entities/order.entity";
import { AmenityCategory } from "../common/entities/amenity-category.entity";
import { EnquiryReply } from "../common/entities/enquiry-reply.entity";
import { CompanyAddress } from "../common/entities/company-address.entity";
import { CompanyBankAccount } from "../common/entities/company-bank-account.entity";
import { UserCompany } from "../common/entities/user-company.entity";
import { UserDocument } from "../common/entities/user-document.entity";
import { CompanyDocument } from "../common/entities/company-document.entity";
import { ProductCommission } from "../common/entities/product-commission.entity";
import { OrderProduct } from "../common/entities/order-products.entity";
import { BlogCategory } from "../common/entities/blog-category.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432", 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    User,
    CompanyAddress,
    CompanyBankAccount,
    CompanyDocument,
    UserCompany,
    UserDocument,
    Role,
    Permission,
    Product,
    ProductVariant,
    ProductCommission,
    UserRole,
    UserPermission,
    RolePermission,
    Collection,
    Blog,
    BlogCategory,
    Page,
    ProductType,
    File,
    Banner,
    Enquiry,
    EnquiryReply,
    Testimonial,
    Discount,
    UserCreationAudit,
    Amenity,
    AmenityCategory,
    Order,
    OrderProduct,
  ],
  migrations: ["src/database/migrations/*.ts"], // Use .ts for generating
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
});

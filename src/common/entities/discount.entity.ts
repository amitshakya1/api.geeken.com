import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { User } from "./user.entity";
import { Product } from "./product.entity";
import { DiscountStatus } from "../enums/discount-status.enum";
import { Collection } from "./collection.entity";

export enum DiscountType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
  FREE_SHIPPING = "free_shipping",
  BUY_X_GET_Y_FREE = "buy_x_get_y_free",
  BUY_X_GET_Y_DISCOUNT = "buy_x_get_y_discount",
}

export enum ApplicableOn {
  ALL_PRODUCTS = "allProducts",
  SPECIFIC_PRODUCTS = "specificProducts",
  SPECIFIC_COLLECTIONS = "specificCollections",
}

@Entity("discounts")
export class Discount {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: DiscountType,
    nullable: false,
  })
  type: DiscountType;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  value: number;

  @Column({ type: "simple-array", nullable: true })
  eligibleProductIds?: string[];

  @Column({ type: "simple-array", nullable: true })
  freeProductIds?: string[];

  @Column({ type: "int", nullable: true })
  buyQuantity?: number;

  @Column({ type: "int", nullable: true })
  getQuantity?: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  minimumOrderValue?: number;

  @Column({ default: false })
  isMaximumDiscountValue: boolean;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  maximumDiscountValue?: number;

  @Column({ default: false })
  isUsageLimitPerUser: boolean;

  @Column({ type: "int", nullable: true })
  usageLimitPerUser?: number;

  @Column({
    type: "enum",
    enum: ApplicableOn,
    default: ApplicableOn.ALL_PRODUCTS,
  })
  applicableOn: ApplicableOn;

  @Column({ type: "timestamp with time zone", nullable: false })
  startDate: Date;

  @Column({ type: "timestamp with time zone", nullable: false })
  endDate: Date;

  @Column({ type: "int", default: 1 })
  usageLimit: number;

  @Column({ type: "int", default: 0 })
  usedCount: number;

  @Column({
    type: "enum",
    enum: DiscountStatus,
    default: DiscountStatus.INACTIVE,
  })
  status: DiscountStatus;

  @Column({ unique: true })
  promoCode: string;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: false })
  isAutoApply: boolean;

  @Column({ default: false })
  isLimitedTime: boolean;

  @Column({ default: false })
  isExclusive: boolean;

  @Column({ default: false })
  isFreeShipping: boolean;

  @Column({ type: "int", nullable: true })
  maxApplicationsPerOrder?: number;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToMany(() => Product, { nullable: true })
  @JoinTable({
    name: "discount_products",
    joinColumn: {
      name: "discountId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "productId",
      referencedColumnName: "id",
    },
  })
  products: Product[];

  @ManyToMany(() => Collection, { nullable: true })
  @JoinTable({
    name: "discount_collections",
    joinColumn: {
      name: "discountId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "collectionId",
      referencedColumnName: "id",
    },
  })
  collections: Collection[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}

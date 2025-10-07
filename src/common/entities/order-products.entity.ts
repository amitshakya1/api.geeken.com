import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { Order } from "./order.entity";
import { Product } from "./product.entity";
import { ProductVariant } from "./product-variant.entity";
import { UpdateProductDto } from "../../admin/products/dto/update-product.dto";
import { UpdateProductVariantDto } from "../../admin/products/dto/update-product-variant.dto";

@Entity("order_products")
export class OrderProduct {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** ---------------- Relations ---------------- **/

  @ManyToOne(() => Order, (order) => order.orderProducts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "orderId" })
  order: Order;

  @Column()
  orderId: string;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: "productId" })
  product?: Product;

  @Column({ nullable: true })
  productId?: string;

  @Column({ type: "jsonb", nullable: true })
  productSnapshot?: Record<string, any>;

  @ManyToOne(() => ProductVariant, { nullable: true })
  @JoinColumn({ name: "variantId" })
  productVariant?: ProductVariant;

  @Column({ nullable: true })
  productVariantId?: string;

  @Column({ type: "jsonb", nullable: true })
  productVariantSnapshot?: Record<string, any>;

  /** ---------------- Hotel Details ---------------- **/

  @Column({ length: 3 }) // ISO currency code (e.g. "INR", "USD")
  currency: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  pricePerNight: number;

  @Column({ type: "int" })
  numberOfRooms: number;

  @Column({ type: "int" })
  nights: number;

  @Column({ type: "int" })
  capacity: number;

  // @Column({ type: "jsonb", nullable: true })
  // cancellationPolicy?: {
  //   freeCancellationUntil: Date;
  //   cancellationFee: number;
  // };

  @Column({ type: "text", nullable: true })
  cancellationPolicy?: string;

  @Column({ type: "text", nullable: true })
  specialRequests?: string;

  @Column({ type: "jsonb", nullable: true })
  extraBed?: {
    available: boolean;
    pricePerNight: number;
  };

  @Column({ type: "jsonb", nullable: true })
  foodOptions?: Array<{
    plan: string;
    additionalPrice: number;
  }>;

  @Column({ type: "jsonb" })
  taxes: Array<{
    type: string;
    percentage: number;
    amount: number;
  }>;

  @Column({ type: "jsonb", nullable: true })
  discountDetails?: {
    discountCode: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountDescription?: string;
    minimumAmount?: number;
    maximumDiscount?: number;
  };

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  commissionPercentage?: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  commissionAmount?: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  taxAmount?: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  discountAmount?: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total: number;

  /** ---------------- Audit Columns ---------------- **/

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  // ✅ Lifecycle hook to calculate subtotal
  @BeforeInsert()
  @BeforeUpdate()
  calculateAmount() {
    const multiplier = this.nights * this.numberOfRooms;

    const base = Number(this.pricePerNight) * multiplier;

    const extra = this.extraBed?.pricePerNight
      ? Number(this.extraBed.pricePerNight) * multiplier
      : 0;

    const food = this.foodOptions?.length
      ? this.foodOptions.reduce(
        (sum, option) =>
          sum + Number(option.additionalPrice || 0) * multiplier,
        0
      )
      : 0;

    this.subtotal = base + extra + food;

    // Taxes
    const TAX_PERCENTAGE = 18;
    const taxAmount = parseFloat(
      ((this.subtotal * TAX_PERCENTAGE) / 100).toFixed(2)
    );
    this.taxAmount = taxAmount;
    this.taxes = [
      {
        type: `GST ${TAX_PERCENTAGE}%`,
        percentage: TAX_PERCENTAGE,
        amount: taxAmount,
      },
    ];

    // Discount
    let discountAmount = 0;

    if (this.discountDetails) {
      const { discountType, discountValue, minimumAmount, maximumDiscount } =
        this.discountDetails;

      // ✅ Only apply discount if subtotal >= minimumAmount
      if (!minimumAmount || this.subtotal >= minimumAmount) {
        if (discountType === "percentage") {
          discountAmount = (this.subtotal * Number(discountValue)) / 100;

          // ✅ Cap at maximumDiscount if defined
          if (maximumDiscount) {
            discountAmount = Math.min(discountAmount, Number(maximumDiscount));
          }
        } else if (discountType === "fixed") {
          discountAmount = Number(discountValue);

          // ✅ Fixed discount should also respect maximumDiscount
          if (maximumDiscount) {
            discountAmount = Math.min(discountAmount, Number(maximumDiscount));
          }
        }
      }
    }

    this.discountAmount = discountAmount;

    // Final total
    this.total = this.subtotal + taxAmount - discountAmount;

    this.total = Math.max(0, this.subtotal + taxAmount - discountAmount);

    // Commission (optional)
    if (this.commissionPercentage) {
      this.commissionAmount =
        (this.total * Number(this.commissionPercentage)) / 100;
    }
  }
}

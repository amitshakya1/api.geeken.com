import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  Unique,
} from "typeorm";
import { User } from "./user.entity";
import { OrderStatus } from "../enums/order-status.enum";
import { OrderProduct } from "./order-products.entity";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  invoiceNo: string;

  @Column({ type: "date" })
  checkInDate: Date;

  @Column({ type: "date" })
  checkOutDate: Date;

  @Column({ type: "jsonb" })
  guests: Array<{
    name: string;
    age?: number;
    gender?: string;
    idProofType?: string;
    idProofNumber?: string;
  }>;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @Column({ type: "jsonb", nullable: true })
  additionalDetails?: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  riskDetails?: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  conversionSummary?: Record<string, any>;

  @Column("text", { array: true, nullable: true })
  communicationChannels?: string[];

  @Column("text", { array: true, nullable: true })
  tags?: string[];

  // Relations
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "guestId" })
  guest: User;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order, {
    cascade: true,
  })
  orderProducts: OrderProduct[];

  @Column({ length: 3 })
  currency: string;

  @Column({ type: "jsonb", nullable: true })
  payment?: Array<{
    paymentId: string;
    paymentMethod: string;
    amountPaid: number;
    currency: string;
    paymentDate: string;
    transactionStatus: string;
  }>;

  @Column({ type: "jsonb", nullable: true })
  discountDetails?: Array<{
    discountCode: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountDescription?: string;
    minimumAmount?: number;
    maximumDiscount?: number;
  }>;

  @Column({ type: "jsonb" })
  taxes: Array<{
    type: string;
    percentage: number;
    amount: number;
  }>;

  @Column({ type: "jsonb", nullable: false })
  commissionRates: Array<{
    productName: string;
    productVariantName: string;
    percentage: number;
    amount: number;
  }>;

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

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @BeforeInsert()
  @BeforeUpdate()
  calculateAmount() {
    // ✅ Aggregate numeric fields
    this.subtotal = this.orderProducts?.reduce(
      (sum, p) => sum + Number(p.subtotal || 0),
      0
    );

    this.discountAmount = this.orderProducts?.reduce(
      (sum, p) => sum + Number(p.discountAmount || 0),
      0
    );

    this.taxAmount = this.orderProducts?.reduce(
      (sum, p) => sum + Number(p.taxAmount || 0),
      0
    );

    this.total = this.orderProducts?.reduce(
      (sum, p) => sum + Number(p.total || 0),
      0
    );

    this.commissionAmount = this.orderProducts?.reduce(
      (sum, p) => sum + Number(p.commissionAmount || 0),
      0
    );

    // ✅ Unique discountDetails
    const discountMap = new Map<string, any>();
    this.orderProducts?.forEach((p) => {
      if (p.discountDetails) {
        const details = Array.isArray(p.discountDetails)
          ? p.discountDetails
          : [p.discountDetails];
        details.forEach((d) => {
          if (!discountMap.has(d.discountCode)) {
            discountMap.set(d.discountCode, d);
          }
        });
      }
    });
    this.discountDetails = Array.from(discountMap.values());

    // ✅ Unique taxes (merge same type by summing amount)
    const taxMap = new Map<
      string,
      { type: string; percentage: number; amount: number }
    >();
    this.orderProducts?.forEach((p) => {
      if (p.taxes) {
        p.taxes.forEach((t) => {
          if (taxMap.has(t.type)) {
            const existing = taxMap.get(t.type);
            existing.amount += Number(t.amount);
          } else {
            taxMap.set(t.type, { ...t });
          }
        });
      }
    });
    this.taxes = Array.from(taxMap.values());

    // ✅ Unique commissionRates (merge same hotel by summing commission)
    const commissionMap = new Map<
      string,
      {
        productName: string;
        productVariantName: string;
        percentage: number;
        amount: number;
      }
    >();

    this.orderProducts?.forEach((p) => {
      const key = `${p.product?.name}-${p.productVariant?.name || "default"}`;
      if (!commissionMap.has(key)) {
        commissionMap.set(key, {
          productName: p.product?.name,
          productVariantName: p.productVariant?.name,
          percentage: Number(p.commissionPercentage),
          amount: Number(p.commissionAmount),
        });
      }
    });

    this.commissionRates = Array.from(commissionMap.values());

    // ✅ Commission Rate (overall average or sum % of subtotal)
    this.commissionPercentage = this.subtotal
      ? (this.commissionAmount / this.subtotal) * 100
      : 0;
  }
}

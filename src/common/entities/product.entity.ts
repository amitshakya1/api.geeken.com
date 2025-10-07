import { EntityStatus } from "../enums/status.enum";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  OneToOne,
} from "typeorm";
import { User } from "./user.entity";
import { Collection } from "./collection.entity";
import { Type as ProductType } from "./type.entity";
import { File } from "./file.entity";
import { ProductVariant } from "./product-variant.entity";
import { Amenity } from "./amenity.entity";
import { ProductCommission } from "./product-commission.entity";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  tagLine?: string;

  @Column("text", { nullable: true })
  description: string;

  @Column({ type: "jsonb", nullable: true })
  address?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };

  @Column({ type: "jsonb", nullable: true })
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };

  @Column({ type: "jsonb", nullable: true })
  bookingContact?: {
    name?: string;
    email?: string;
    phone?: string;
    designation?: string;
  };

  @Column({ type: "jsonb", nullable: true })
  policies?: {
    check_in?: string;
    check_out?: string;
    cancellation?: string;
  };

  @Column("decimal", { precision: 9, scale: 6, nullable: true })
  latitude?: number;

  @Column("decimal", { precision: 9, scale: 6, nullable: true })
  longitude?: number;

  @Column("text", { array: true, nullable: true })
  tags?: string[];

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  badge: string;

  @Column({ nullable: true })
  embedMapUrl: string;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  rating: number;

  @OneToOne(() => ProductCommission, (commission) => commission.product, {
    cascade: true,
  })
  commission: ProductCommission;

  @Column({ nullable: true })
  cancellationPolicy?: string;

  @Column({ nullable: true })
  seoTitle?: string;

  @Column({ nullable: true })
  seoKeywords?: string;

  @Column({ nullable: true })
  seoDescription?: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => User, { nullable: false })
  partner: User;

  @ManyToMany(() => Collection, (collection) => collection.products)
  @JoinTable()
  collections: Collection[];

  @ManyToMany(() => Amenity, (amenity) => amenity.products)
  @JoinTable()
  amenities: Amenity[];

  @ManyToOne(() => ProductType, (type) => type.products, { nullable: true })
  type: ProductType;

  @ManyToMany(() => File, { nullable: true })
  @JoinTable({
    name: "product_files",
    joinColumn: {
      name: "productId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "fileId",
      referencedColumnName: "id",
    },
  })
  files: File[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @Column({
    type: "enum",
    enum: EntityStatus,
    default: EntityStatus.DRAFT,
  })
  status: EntityStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}

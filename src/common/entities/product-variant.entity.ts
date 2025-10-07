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
  JoinColumn,
  JoinTable,
  Index,
} from "typeorm";
import { Product } from "./product.entity";
import { File } from "./file.entity";
import { Amenity } from "./amenity.entity";

export interface OptionValue {
  optionName: string;
  optionValue: string;
}

const decimalTransformer = {
  to: (value: number | null) => value, // writing to DB
  from: (value: string | null): number | null =>
    value === null ? null : parseFloat(value), // reading from DB
};

@Entity("product_variants")
@Index(["productId", "name"], { unique: true })
export class ProductVariant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "productId" })
  productId: string;

  @Column()
  name: string;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  price: number;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
    nullable: true,
  })
  compareAtPrice?: number;

  @Column({ default: "INR" })
  currency: string;

  @Column({ nullable: true })
  totalRooms?: number;

  @Column({ nullable: true })
  capacity?: number;

  @Column("jsonb", { nullable: true })
  dimensions?: {
    area_sq_m?: number;
  };

  @Column("jsonb", { nullable: true })
  extraBed?: {
    available?: boolean;
    pricePerNight?: number;
  };

  @Column("jsonb", { nullable: true })
  foodOptions?: Array<{
    plan: string;
    additionalPrice: number;
  }>;

  @ManyToMany(() => File, { nullable: true })
  @JoinTable({
    name: "product_variant_files",
    joinColumn: {
      name: "productVariantId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "fileId",
      referencedColumnName: "id",
    },
  })
  files: File[];

  @ManyToMany(() => Amenity, (amenity) => amenity.productVariants)
  @JoinTable()
  amenities: Amenity[];

  @Column({
    type: "enum",
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status: EntityStatus;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}

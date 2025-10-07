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
} from "typeorm";
import { User } from "./user.entity";
import { EntityStatus } from "../enums/status.enum";
import { AmenityCategory } from "./amenity-category.entity";
import { Product } from "./product.entity";
import { ProductVariant } from "./product-variant.entity";

@Entity("amenities")
export class Amenity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column()
  amenityCategoryId: string;

  @ManyToOne((name: "amenityCategoryId") => AmenityCategory, { nullable: false })
  amenityCategory: AmenityCategory;

  @ManyToMany(() => Product, (product) => product.amenities)
  products: Product[];

  @ManyToMany(
    () => ProductVariant,
    (productVariant) => productVariant.amenities
  )
  productVariants: ProductVariant[];

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

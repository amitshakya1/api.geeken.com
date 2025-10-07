import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from "typeorm";
import { Product } from "./product.entity";
import { User } from "./user.entity";

@Entity("product_commissions")
export class ProductCommission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => Product, (product) => product.commission, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product: Product;

  @ManyToOne(() => User, (user) => user.productCommissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "partnerId" })
  partner: User;

  @Column("int")
  percentage: number; // percentage or amount

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

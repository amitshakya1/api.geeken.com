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
import { Product } from "./product.entity";
import { EntityStatus } from "../enums/status.enum";

@Entity("types")
export class Type {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @OneToMany(() => Product, (product) => product.type)
  products: Product[];

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

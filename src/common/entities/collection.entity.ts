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
  JoinTable,
} from "typeorm";
import { User } from "./user.entity";
import { Product } from "./product.entity";
import { File } from "./file.entity";

@Entity("collections")
export class Collection {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  tagLine?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  seoTitle?: string;

  @Column({ nullable: true })
  seoKeywords?: string;

  @Column({ nullable: true })
  seoDescription?: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToMany(() => Product, (product) => product.collections)
  products: Product[];

  @ManyToMany(() => File, { nullable: true })
  @JoinTable({
    name: "collection_files",
    joinColumn: {
      name: "collection_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "file_id",
      referencedColumnName: "id",
    },
  })
  files: File[];

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

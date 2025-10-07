import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
} from "typeorm";
import { User } from "./user.entity";
import { EntityStatus } from "../enums/status.enum";
import { Blog } from "./blog.entity";

@Entity("blogs_categories")
export class BlogCategory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToMany(() => Blog, (blog) => blog.categories)
  blogs: Blog[];

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

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
import { File } from "./file.entity";

@Entity("pages")
export class Page {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
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

  @ManyToMany(() => File, { nullable: true })
  @JoinTable({
    name: "page_files",
    joinColumn: {
      name: "pageId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "fileId",
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

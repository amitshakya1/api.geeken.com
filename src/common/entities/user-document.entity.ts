import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { File } from "./file.entity";

@Entity("user_documents")
export class UserDocument {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.documents, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  type: "aadhaar" | "pan" | "gst" | "passport" | "voter_id" | "driving_license";

  @Column({ nullable: true })
  idNumber?: string;

  @ManyToOne(() => File, { eager: true, nullable: true })
  @JoinColumn({ name: "frontFileId" })
  frontFile: File;

  @ManyToOne(() => File, { eager: true, nullable: true })
  @JoinColumn({ name: "backFileId" })
  backFile: File;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

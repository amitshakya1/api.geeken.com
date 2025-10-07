import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { File } from "./file.entity";
import { Enquiry } from "./enquiry.entity";
import { User } from "./user.entity";

@Entity("enquiry_replies")
export class EnquiryReply {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  message: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "userId" })
  user?: User;

  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: "fileId" })
  file?: File;

  @ManyToOne(() => Enquiry, (enquiry) => enquiry.replies)
  enquiry: Enquiry;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

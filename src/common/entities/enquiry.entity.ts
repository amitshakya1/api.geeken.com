import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { EnquiryStatus } from "../enums/enquiry-status.enum";
import { File } from "./file.entity";
import { User } from "./user.entity";
import { EnquiryReply } from "./enquiry-reply.entity";

export enum EnquiryType {
  Enquiry = "enquiry", // Just submitted, no action taken yet
  Support = "support", // Assigned to a team member
}

@Entity("enquiries")
export class Enquiry {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  subject?: string;

  @Column({ type: "text" })
  message: string;

  @Column({ nullable: true })
  source?: string;

  @ManyToMany(() => File, { nullable: true })
  @JoinTable({
    name: "enquiry_files",
    joinColumn: {
      name: "enquiry_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "file_id",
      referencedColumnName: "id",
    },
  })
  files: File[];

  @Column({ type: "jsonb", nullable: true })
  leadSource?: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  customFields?: Record<string, any>;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "userId" })
  user?: User;

  @Column({
    type: "enum",
    enum: EnquiryStatus,
    default: EnquiryStatus.NEW,
  })
  status: EnquiryStatus;

  @Column({
    type: "enum",
    enum: EnquiryType,
    default: EnquiryType.Enquiry,
  })
  type: EnquiryType;

  @Column({ type: "timestamp", nullable: true })
  emailSentAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  whatsappMessageSentAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  smsSentAt?: Date;

  @OneToMany(() => EnquiryReply, (reply) => reply.enquiry, { cascade: true })
  replies: EnquiryReply[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}

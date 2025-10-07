import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { UserCompany } from "./user-company.entity";
import { File } from "./file.entity";

@Entity("company_documents")
export class CompanyDocument {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => UserCompany, (company) => company.documents, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "companyId" })
  company: UserCompany;

  @Column()
  type: "registration_certificate" | "pan" | "gst";

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

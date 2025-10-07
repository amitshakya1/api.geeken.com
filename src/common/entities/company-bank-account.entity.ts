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

@Entity("company_bank_accounts")
export class CompanyBankAccount {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => UserCompany, (company) => company.bankAccounts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "companyId" })
  company: UserCompany;

  @Column()
  bankName: string;

  @Column()
  accountNumber: string;

  @Column()
  accountHolderName: string;

  @Column()
  ifscCode: string;

  @Column()
  upiName: string;

  @Column()
  upiAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { CompanyAddress } from "./company-address.entity";
import { CompanyBankAccount } from "./company-bank-account.entity";
import { User } from "./user.entity";
import { CompanyDocument } from "./company-document.entity";

@Entity("user_companies")
export class UserCompany {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.companies, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  pincode: string;

  @Column()
  country: string;

  @Column()
  gstName: string;

  @Column()
  gstNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CompanyAddress, (address) => address.company)
  addresses: CompanyAddress[];

  @OneToMany(() => CompanyBankAccount, (bankAccount) => bankAccount.company)
  bankAccounts: CompanyBankAccount[];

  @OneToMany(() => CompanyDocument, (document) => document.company)
  documents: CompanyDocument[];
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { UserCompany } from "./user-company.entity";

@Entity("company_addresses")
export class CompanyAddress {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => UserCompany, (company) => company.addresses, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "companyId" })
  company: UserCompany;

  @Column()
  type: "registered_office" | "correspondence" | "billing";

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
}

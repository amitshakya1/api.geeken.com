import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Exclude } from "class-transformer";
import * as bcrypt from "bcryptjs";

import { UserRole } from "./user-role.entity";
import { UserPermission } from "./user-permission.entity";
import { File } from "./file.entity";
import { EntityStatus } from "../enums/status.enum";
import { UserCompany } from "./user-company.entity";
import { UserDocument } from "./user-document.entity";
import { ProductCommission } from "./product-commission.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  embedMapUrl: string;

  @Column({
    type: "enum",
    enum: EntityStatus,
    default: EntityStatus.DRAFT,
  })
  status: EntityStatus;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  @Exclude()
  passwordResetToken: string;

  @Column({ nullable: true })
  @Exclude()
  passwordResetExpires: Date;

  @Column({ nullable: true })
  @Exclude()
  emailVerificationToken: string;

  @Column({ nullable: true })
  @Exclude()
  phoneVerificationToken: string;

  @ManyToOne(() => File)
  @JoinColumn({ name: 'imageId' })
  image: File;

  @ManyToMany(() => File, { nullable: true })
  @JoinTable({
    name: "user_files",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "file_id",
      referencedColumnName: "id",
    },
  })
  files: File[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(
    () => ProductCommission,
    (productCommission) => productCommission.partner,
    {
      cascade: true,
    }
  )
  productCommissions: ProductCommission[];

  @OneToMany(() => UserPermission, (userPermission) => userPermission.user)
  userPermissions: UserPermission[];

  @OneToMany(() => UserCompany, (company) => company.user, {
    cascade: true,
    orphanedRowAction: "delete",
    onDelete: "CASCADE",
  })
  companies: UserCompany[];

  @OneToMany(() => UserDocument, (document) => document.user, {
    cascade: true,
    orphanedRowAction: "delete",
    onDelete: "CASCADE",
  })
  documents: UserDocument[];

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

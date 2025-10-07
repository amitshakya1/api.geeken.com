import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("user_creation_audit")
export class UserCreationAudit {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  targetUserId: string;

  @Column()
  createdByAdminId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  targetUser: User;

  @ManyToOne(() => User)
  @JoinColumn()
  createdByAdmin: User;
}

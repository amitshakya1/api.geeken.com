import { User } from './user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { EntityStatus } from '../enums/status.enum';

@Entity('files')
export class File {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    altText: string;

    @Column({ nullable: false })
    fileName: string;

    @Column({ nullable: false })
    mimeType: string;

    @Column({ nullable: false })
    disk: string; // s3, local

    @Column({ nullable: false })
    conversionsDisk: string; // s3, local

    @Column('int', { nullable: false })
    size: number;

    @Column('json', { nullable: true })
    generatedConversions: any;

    @ManyToOne(() => User, { nullable: false })
    user: User;

    @Column({
        type: 'enum',
        enum: EntityStatus,
        default: EntityStatus.ACTIVE,
    })
    status: EntityStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
} 
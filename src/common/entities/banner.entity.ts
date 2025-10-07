import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from './user.entity';
import { File } from './file.entity';
import { EntityStatus } from '../enums/status.enum';

@Entity('banners')
export class Banner {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    tagLine: string | null;

    @Column({ nullable: true })
    description: string | null;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => File)
    @JoinColumn({ name: 'mobileImageId' })
    mobileImage: File;

    @ManyToOne(() => File)
    @JoinColumn({ name: 'desktopImageId' })
    desktopImage: File;

    @Column({
        type: 'enum',
        enum: EntityStatus,
        default: EntityStatus.DRAFT,
    })
    status: EntityStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date | null;
} 
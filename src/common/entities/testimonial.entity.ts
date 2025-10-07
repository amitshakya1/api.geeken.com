import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { EntityStatus } from '../enums/status.enum';
import { File } from './file.entity';
import { User } from './user.entity';

@Entity('testimonials')
export class Testimonial {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    authorName: string;

    @Column({ nullable: true })
    authorDesignation?: string;

    @Column({ nullable: true })
    company?: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'float' })
    rating: number;

    @ManyToOne(() => File, { nullable: true })
    @JoinColumn({ name: 'imageId' })
    image?: File;

    @ManyToOne(() => File, { nullable: true })
    @JoinColumn({ name: 'videoId' })
    video?: File;

    @Column({ nullable: true })
    source?: string;

    @Column({ type: 'enum', enum: EntityStatus })
    status: EntityStatus;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user?: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
} 
import { EntityStatus } from '../enums/status.enum';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { File } from './file.entity';
import { BlogCategory } from './blog-category.entity';

@Entity('blogs')
export class Blog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ nullable: true })
    tagLine?: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    seoTitle?: string;

    @Column({ nullable: true })
    seoKeywords?: string;

    @Column({ nullable: true })
    seoDescription?: string;

    @ManyToMany(() => BlogCategory, (category) => category.blogs)
    @JoinTable()
    categories: BlogCategory[];

    @ManyToOne(() => User, { nullable: false })
    user: User;

    @ManyToMany(() => File, { nullable: true })
    @JoinTable({
        name: 'blog_files',
        joinColumn: {
            name: 'blog_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'file_id',
            referencedColumnName: 'id',
        },
    })
    files: File[];

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
    deletedAt?: Date;
} 
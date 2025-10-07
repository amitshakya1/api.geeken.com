import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { Blog } from '../../common/entities/blog.entity';
import { File } from '../../common/entities/file.entity';
import { BlogCategory } from '../../common/entities/blog-category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Blog, File, BlogCategory])],
    controllers: [BlogsController],
    providers: [BlogsService],
})
export class BlogsModule { } 
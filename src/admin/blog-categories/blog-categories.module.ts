import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogCategoriesService } from './blog-categories.service';
import { BlogCategoriesController } from './blog-categories.controller';
import { BlogCategory } from '../../common/entities/blog-category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([BlogCategory])],
    controllers: [BlogCategoriesController],
    providers: [BlogCategoriesService],
})
export class BlogCategoriesModule { }

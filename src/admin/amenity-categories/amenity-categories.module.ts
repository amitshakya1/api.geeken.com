import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmenityCategoriesService } from './amenity-categories.service';
import { AmenityCategoriesController } from './amenity-categories.controller';
import { AmenityCategory } from '../../common/entities/amenity-category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AmenityCategory])],
    controllers: [AmenityCategoriesController],
    providers: [AmenityCategoriesService],
})
export class AmenityCategoriesModule { } 
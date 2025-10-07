import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsController } from './testimonials.controller';
import { Testimonial } from '../../common/entities/testimonial.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Testimonial])],
    controllers: [TestimonialsController],
    providers: [TestimonialsService],
    exports: [TestimonialsService],
})
export class TestimonialsModule { } 
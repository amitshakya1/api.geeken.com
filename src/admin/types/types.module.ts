import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypesService } from './types.service';
import { TypesController } from './types.controller';
import { Type as TypeEntity } from '../../common/entities/type.entity';
import { Product } from '../../common/entities/product.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TypeEntity, Product])],
    controllers: [TypesController],
    providers: [TypesService],
})
export class TypesModule { } 
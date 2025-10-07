import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permission } from '../../common/entities/permission.entity';
import { PermissionsGateway } from './permissions.gateway';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    UsersModule,
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsGateway],
  exports: [PermissionsService, PermissionsGateway],
})
export class PermissionsModule { }
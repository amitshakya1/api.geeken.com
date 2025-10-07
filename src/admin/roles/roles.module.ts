import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from '../../common/entities/role.entity';
import { RolePermission } from '../../common/entities/role-permission.entity';
import { Permission } from '../../common/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, RolePermission, Permission]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule { }
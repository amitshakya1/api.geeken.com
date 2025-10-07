import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '../../../common/enums/status.enum';

export class CreatePermissionDto {
  @ApiProperty({ example: 'create_user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Permission to create users' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Users', description: 'Permission group/category' })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiPropertyOptional({ enum: EntityStatus, example: 'active' })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
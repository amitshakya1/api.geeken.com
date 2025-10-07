import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '../../../common/enums/status.enum';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Administrator role with full access' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: ['create_user', 'read_user', 'update_user', 'delete_user'],
    description: 'Array of permission names to assign to this role'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ enum: EntityStatus, example: 'active' })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
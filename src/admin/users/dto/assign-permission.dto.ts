import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionDto {
  @ApiProperty({ example: 'create_user' })
  @IsString()
  @IsNotEmpty()
  permissionName: string;
}
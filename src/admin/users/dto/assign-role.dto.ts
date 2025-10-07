import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  roleName: string;
}
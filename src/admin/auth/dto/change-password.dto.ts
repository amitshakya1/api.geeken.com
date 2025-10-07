import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({ example: 'admin$123' })
    @IsString()
    oldPassword: string;

    @ApiProperty({ example: 'password$123' })
    @IsString()
    @MinLength(6)
    newPassword: string;
} 
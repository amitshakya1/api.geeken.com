import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'info@gokaasa.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
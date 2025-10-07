import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'info@geeken.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
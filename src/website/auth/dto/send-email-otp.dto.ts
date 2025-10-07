import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailOtpDto {
  @ApiPropertyOptional({ example: 'info@gokaasa.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
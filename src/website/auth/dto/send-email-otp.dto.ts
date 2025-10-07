import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailOtpDto {
  @ApiPropertyOptional({ example: 'info@geeken.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
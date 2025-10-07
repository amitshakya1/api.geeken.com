import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyEmailOtpDto {
  @ApiPropertyOptional({ example: 'info@geeken.com' })
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
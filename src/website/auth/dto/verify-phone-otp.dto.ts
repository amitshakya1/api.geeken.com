import { IsPhoneNumber, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPhoneOtpDto {
  @ApiPropertyOptional({ example: '+919999677947' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
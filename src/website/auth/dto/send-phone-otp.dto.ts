import { IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SendPhoneOtpDto {
  @ApiPropertyOptional({ example: '+919999677947' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone?: string;
}
import {
  IsOptional,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsArray,
  IsUUID,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "Amit" })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: "Shakya" })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: "info@gokaasa.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "+919999677947" })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({
    type: [String],
    example: [
      "a1b2c3d4-5678-1234-5678-abcdef123456",
      "b2c3d4e5-6789-2345-6789-bcdef2345678",
    ],
    description: "Array of file UUIDs to associate with the user",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  fileIds?: string[];
}

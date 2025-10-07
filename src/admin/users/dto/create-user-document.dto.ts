import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNotEmpty, IsEnum } from "class-validator";

export class CreateUserDocumentDto {
  @ApiProperty({
    example: "uuid-here",
    description: "User document id on update",
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    example: "aadhaar",
    description: "Document type",
    enum: ["aadhaar", "pan", "gst", "passport", "voter_id", "driving_license"],
  })
  @IsString()
  @IsNotEmpty()
  type: "aadhaar" | "pan" | "gst" | "passport" | "voter_id" | "driving_license";

  @ApiPropertyOptional({
    example: "1234-5678-9012",
    description: "Document ID Number",
  })
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiPropertyOptional({
    example: "file-uuid-front",
    description: "Front File ID",
  })
  @IsOptional()
  @IsString()
  frontFileId?: string;

  @ApiPropertyOptional({
    example: "file-uuid-back",
    description: "Back File ID",
  })
  @IsOptional()
  @IsString()
  backFileId?: string;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNotEmpty, IsEnum } from "class-validator";

export class CreateCompanyDocumentDto {
  @ApiProperty({
    example: "uuid-here",
    description: "company document id on update",
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    example: "aadhaar",
    description: "Document type",
    enum: ["registration_certificate", "pan", "gst"],
  })
  @IsString()
  @IsNotEmpty()
  type: "registration_certificate" | "pan" | "gst";

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

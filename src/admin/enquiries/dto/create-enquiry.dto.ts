import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsArray,
  IsObject,
  IsDateString,
  IsUUID,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { EnquiryStatus } from "../../../common/enums/enquiry-status.enum";
import { EnquiryType } from "../../../common/entities/enquiry.entity";

export class CreateEnquiryDto {
  @ApiProperty({ example: "John Doe" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: "john.doe@example.com" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: "+1234567890" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "General Inquiry" })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: "I would like to know more about your services." })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: "website" })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ["uuid1", "uuid2", "uuid3"],
    description: "Array of file UUIDs to associate with the enquiry",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  fileIds?: string[];

  @ApiPropertyOptional({
    example: { campaign: "google_ads", utm_source: "google" },
    description: "Lead source information",
  })
  @IsOptional()
  @IsObject()
  leadSource?: Record<string, any>;

  @ApiPropertyOptional({
    example: { company: "ABC Corp", industry: "Technology" },
    description: "Custom fields for the enquiry",
  })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @ApiPropertyOptional({ enum: EnquiryStatus, example: "new" })
  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @ApiPropertyOptional({ enum: EnquiryType, example: "enquiry" })
  @IsNotEmpty()
  @IsEnum(EnquiryType)
  type: EnquiryType;

  @ApiPropertyOptional({ example: "2024-01-15T10:30:00Z" })
  @IsOptional()
  @IsDateString()
  emailSentAt?: Date;

  @ApiPropertyOptional({ example: "2024-01-15T10:30:00Z" })
  @IsOptional()
  @IsDateString()
  whatsappMessageSentAt?: Date;

  @ApiPropertyOptional({ example: "2024-01-15T10:30:00Z" })
  @IsOptional()
  @IsDateString()
  smsSentAt?: Date;

  @ApiPropertyOptional({
    type: "array",
    example: [
      {
        id: "uuid-here",
        message: "Thank you for your enquiry",
        repliedAt: "2024-01-15T11:00:00Z",
        repliedBy: "admin@example.com",
        file: "uuid-of-reply-file",
      },
    ],
    description: "Array of replies to the enquiry",
  })
  @IsOptional()
  @IsArray()
  replies?: {
    id?: string;
    message: string;
    userId?: string;
    file?: string;
  }[];
}

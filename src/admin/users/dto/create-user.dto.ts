import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsPhoneNumber,
  IsArray,
  IsUUID,
  IsEnum,
  ValidateNested,
  IsInt,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { EntityStatus } from "../../../common/enums/status.enum";
import { CreateUserCompanyDto } from "./create-user-company.dto";
import { CreateUserDocumentDto } from "./create-user-document.dto";
import { UpdateProductCommissionDto } from "../../products/dto/product-commission.dto";

export class CreateUserDto {
  @ApiProperty({ example: "John", description: "User's first name" })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: "Doe", description: "User's last name" })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    example: "+1234567890",
    description: "User's phone number",
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({
    example: "john@example.com",
    description: "User's email address",
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: "password123",
    description: "User's password (min 6 chars)",
  })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'uuid-of-image' })
  // @ValidateIf((_, value) => value !== "") // skip validation if empty string
  @IsUUID()
  @IsOptional()
  imageId?: string;

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

  @ApiProperty({ example: 'Please add user role' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    example: ["create_user", "read_user", "update_user", "delete_user"],
    description: "Array of permission names to assign to this user",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({
    enum: EntityStatus,
    example: "active",
    description: "User status",
  })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @ApiPropertyOptional({
    type: [CreateUserCompanyDto],
    description: "List of user companies",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserCompanyDto)
  companies?: CreateUserCompanyDto[];

  @ApiPropertyOptional({
    type: [UpdateProductCommissionDto],
    description: "List of product commissions",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductCommissionDto)
  productCommissions?: UpdateProductCommissionDto[];

  @ApiPropertyOptional({
    type: [CreateUserDocumentDto],
    description: "List of user documents",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDocumentDto)
  documents?: CreateUserDocumentDto[];


}

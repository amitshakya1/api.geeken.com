import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
} from "class-validator";
import { CreateCompanyBankAccountDto } from "./create-company-bank-account.dto";
import { CreateCompanyAddressDto } from "./create-company-address.dto";
import { CreateCompanyDocumentDto } from "./create-company-document.dto";

export class CreateUserCompanyDto {
  @ApiProperty({
    example: "uuid-here",
    description: "User company id on update",
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: "Acme Corp", description: "Company Name" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "info@acme.com", description: "Company Email" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "+1234567890", description: "Company Phone" })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: "123 Main St", description: "Company Address" })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: "New York", description: "City" })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: "NY", description: "State" })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: "10001", description: "Pincode" })
  @IsString()
  @IsNotEmpty()
  pincode: string;

  @ApiProperty({ example: "USA", description: "Country" })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: "Acme GST", description: "GST Name" })
  @IsString()
  @IsNotEmpty()
  gstName: string;

  @ApiProperty({ example: "22AAAAA0000A1Z5", description: "GST Number" })
  @IsString()
  @IsNotEmpty()
  gstNumber: string;

  @ApiPropertyOptional({
    type: [CreateCompanyAddressDto],
    description: "List of company addresses",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCompanyAddressDto)
  addresses?: CreateCompanyAddressDto[];

  @ApiPropertyOptional({
    type: [CreateCompanyBankAccountDto],
    description: "List of company bank accounts",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCompanyBankAccountDto)
  bankAccounts?: CreateCompanyBankAccountDto[];

  @ApiPropertyOptional({
    type: [CreateCompanyDocumentDto],
    description: "List of company documents",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCompanyDocumentDto)
  documents?: CreateCompanyDocumentDto[];
}

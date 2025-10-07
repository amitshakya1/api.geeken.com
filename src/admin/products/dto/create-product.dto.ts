import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
  IsArray,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { EntityStatus } from "../../../common/enums/status.enum";
import { CreateProductVariantDto } from "./create-product-variant.dto";
import { UpdateProductCommissionDto } from "./product-commission.dto";

class AddressDto {
  @ApiPropertyOptional({ description: "Street address" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: "City" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: "State" })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: "Country" })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: "Pincode/Postal code" })
  @IsOptional()
  @IsString()
  pincode?: string;
}

class ContactDto {
  @ApiPropertyOptional({ description: "Phone number" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "Email address" })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: "Website URL" })
  @IsOptional()
  @IsString()
  name?: string;
}

class BookingContactDto {
  @ApiPropertyOptional({ description: "Full name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Email address" })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: "Phone number" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "Designation" })
  @IsOptional()
  @IsString()
  designation?: string;
}

class PoliciesDto {
  @ApiPropertyOptional({ description: "Check-in time (e.g., 14:00)" })
  @IsOptional()
  @IsString()
  check_in?: string;

  @ApiPropertyOptional({ description: "Check-out time (e.g., 12:00)" })
  @IsOptional()
  @IsString()
  check_out?: string;

  @ApiPropertyOptional({ description: "Cancellation policy" })
  @IsOptional()
  @IsString()
  cancellation?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: "iPhone 15" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "Latest iPhone model with advanced features" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: "Unique slug for the product" })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: "Short tagline for the product" })
  @IsOptional()
  @IsString()
  tagLine?: string;

  @ApiPropertyOptional({ description: "Badge for the product" })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiPropertyOptional({
    description: "Address information",
    type: () => AddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({
    description: "Contact information",
    type: () => ContactDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactDto)
  contact?: ContactDto;

  @ApiPropertyOptional({
    description: "Booking contact information",
    type: () => BookingContactDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BookingContactDto)
  bookingContact?: BookingContactDto;

  @ApiPropertyOptional({
    description: "Policies information",
    type: () => PoliciesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PoliciesDto)
  policies?: PoliciesDto;

  @ApiPropertyOptional({
    description: "Website of the product", example:
      "https://www.myhotel.com",
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({
    example:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3505.5106061929564!2d77.1953413!3d28.5243684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d05e735a7a119%3A0x162bcd1bd1447522!2sMake%20My%20Business%20Online%20(MMBO)%20%7C%20Best%20Digital%20Marketing%20Agency%20in%20Delhi%20NCR!5e0!3m2!1sen!2sin!4v1756800582814!5m2!1sen!2sin",
    description: "Google Map embed url",
  })
  @IsString()
  @IsOptional()
  embedMapUrl?: string;

  @ApiPropertyOptional({
    description: "Rating of the product",
    type: Number,
    example: 4.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({
    description: "Latitude",
    type: Number,
    example: 15.2993,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: "Longitude",
    type: Number,
    example: 74.124,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    description: "Tags related to order",
    example: ["VIP", "HolidayBooking"],
    required: false,
  })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: "Array of collection UUIDs to associate with the product",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  collectionIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: "Array of amenity UUIDs to associate with the product",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  amenityIds?: string[];

  @ApiProperty({ description: "Partner ID associated with the product" })
  @IsUUID()
  @IsNotEmpty()
  partnerId: string;

  @ApiPropertyOptional({
    type: String,
    description: "ID of the type this product belongs to",
  })
  @IsOptional()
  typeId?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ["uuid1", "uuid2", "uuid3"],
    description: "Array of file UUIDs to associate with the product",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  fileIds?: string[];

  @ApiPropertyOptional({
    type: [CreateProductVariantDto],
    description: "List of product variants",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];

  @ApiPropertyOptional({ description: "SEO title" })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: "SEO keywords" })
  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @ApiPropertyOptional({ description: "SEO description" })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ enum: EntityStatus, example: "active" })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

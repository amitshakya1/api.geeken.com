import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUrl,
  Min,
  IsUUID,
  ValidateNested,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { EntityStatus } from "../../../common/enums/status.enum";

export class DimensionsDto {

  @ApiProperty({
    example: 26,
    description: "Total area of the room in square meters",
  })
  @IsNumber()
  area_sq_m: number;
}

export class ExtraBedDto {
  @ApiProperty({ example: true, description: "Whether extra bed is available" })
  @IsBoolean()
  available: boolean;

  @ApiProperty({ example: 1500, description: "Price per night for extra bed" })
  @IsNumber()
  @Min(0)
  pricePerNight: number;
}

export class FoodOptionDto {
  @ApiProperty({ example: "Breakfast Included", description: "Meal plan name" })
  @IsString()
  plan: string;

  @ApiProperty({
    example: 500,
    description: "Additional price for this meal plan",
  })
  @IsNumber()
  @Min(0)
  additionalPrice: number;
}

export class CreateProductVariantDto {
  @ApiProperty({
    example: "uuid-here",
    description: "company address id on update",
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: "The UUID of the parent product this variant belongs to",
    example: "123e4567-e89b-12d3-a456-426614174000",
    type: String,
  })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({
    description: "The title/name of the product variant",
    example: "iPhone 15 Pro - 128GB - Natural Titanium",
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "The selling price of the product variant",
    example: 999.99,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: "The original/compare-at price (for showing discounts)",
    example: 1199.99,
    required: false,
    minimum: 0,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiProperty({
    description: "The currency code for the pricing",
    example: "INR",
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: "Total number of rooms available in the hotel",
    example: 50,
    required: false,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalRooms?: number;

  @ApiProperty({
    description: "Total capacity of rooms available in the hotel",
    example: 50,
    required: false,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @ApiProperty({
    type: DimensionsDto,
    required: false,
    example: {
      length_m: 6.5,
      width_m: 4.0,
      area_sq_m: 26,
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;

  @ApiProperty({
    type: ExtraBedDto,
    required: false,
    example: {
      available: true,
      pricePerNight: 1500,
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExtraBedDto)
  extraBed?: ExtraBedDto;

  @ApiProperty({
    description: "Array of available food/meal options for the room",
    type: [FoodOptionDto],
    example: [
      { plan: "Breakfast Included", additionalPrice: 500 },
      { plan: "Half Board", additionalPrice: 1200 },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FoodOptionDto)
  foodOptions?: FoodOptionDto[];

  @ApiProperty({
    description: "Array of file UUIDs associated with this product variant",
    example: [
      "123e4567-e89b-12d3-a456-426614174001",
      "123e4567-e89b-12d3-a456-426614174002",
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  fileIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: "Array of amenity UUIDs to associate with the product variant",
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  amenityIds?: string[];

  @ApiPropertyOptional({ enum: EntityStatus, example: "active" })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

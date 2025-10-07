import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsUUID,
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsArray,
  ValidateNested,
  IsISO4217CurrencyCode,
} from "class-validator";
import { Type } from "class-transformer";

class ExtraBedDto {
  @ApiProperty({ description: "Is extra bed available?", example: true })
  @IsOptional()
  available: boolean;

  @ApiProperty({ description: "Price per night for extra bed", example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerNight: number;
}

class FoodOptionDto {
  @ApiProperty({ description: "Meal plan name", example: "Breakfast Included" })
  @IsString()
  plan: string;

  @ApiProperty({ description: "Additional price per night", example: 200 })
  @IsNumber()
  @Min(0)
  additionalPrice: number;
}

export class CreateOrderProductDto {
  /** ---------------- Relations ---------------- **/

  @ApiProperty({ description: "Order ID (UUID)", example: "uuid-here" })
  @IsUUID()
  orderId: string;

  @ApiPropertyOptional({ description: "Product ID (UUID)" })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: "Product variant ID (UUID)" })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  /** ---------------- Hotel Details ---------------- **/

  @ApiProperty({
    description: "Currency code (ISO 4217)",
    example: "USD",
  })
  @IsISO4217CurrencyCode()
  currency: string;

  @ApiProperty({ description: "Price per night", example: 1200 })
  @IsNumber()
  @Min(0)
  pricePerNight: number;

  @ApiProperty({ description: "Number of rooms", example: 2 })
  @IsInt()
  @Min(1)
  numberOfRooms: number;

  @ApiProperty({ description: "Number of nights", example: 3 })
  @IsInt()
  @Min(1)
  nights: number;

  @ApiProperty({ description: "Guest capacity", example: 4 })
  @IsInt()
  @Min(1)
  capacity: number;

  /** ---------------- Commission ---------------- **/

  @ApiPropertyOptional({ description: "Commission rate (%)", example: 10 })
  @IsOptional()
  @IsNumber()
  commissionRate?: number;

  @ApiPropertyOptional({ description: "Commission amount", example: 150 })
  @IsOptional()
  @IsNumber()
  commissionAmount?: number;

  /** ---------------- Extras ---------------- **/

  @ApiPropertyOptional({ type: () => ExtraBedDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExtraBedDto)
  extraBed?: ExtraBedDto;

  @ApiPropertyOptional({ type: () => [FoodOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FoodOptionDto)
  foodOptions?: FoodOptionDto[];

  /** ---------------- Misc ---------------- **/

  @ApiPropertyOptional({
    description: "Special requests",
    example: "Need early check-in and extra pillows",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  specialRequests?: string;
}

import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsUUID,
  IsDateString,
  IsArray,
  IsNumber,
  IsOptional,
  IsEnum,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";
import { OrderStatus } from "../../../common/enums/order-status.enum";
import { CreateOrderProductDto } from "./create-order-product.dto";

export class CreateOrderDto {
  @ApiProperty({ description: "Guest user ID (UUID)" })
  @IsUUID()
  guestId: string;

  @ApiProperty({ description: "Check-in date", example: "2025-09-05" })
  @IsDateString()
  checkInDate: Date;

  @ApiProperty({ description: "Check-out date", example: "2025-09-10" })
  @IsDateString()
  checkOutDate: Date;

  @ApiProperty({
    description: "List of guests",
    example: [
      {
        name: "John Doe",
        age: 30,
        gender: "male",
        idProofType: "Passport",
        idProofNumber: "X1234567",
      },
    ],
  })
  @IsArray()
  guests: Array<{
    name: string;
    age?: number;
    gender?: string;
    idProofType?: string;
    idProofNumber?: string;
  }>;

  @ApiProperty({
    description: "Taxes applied on order",
    example: [
      { type: "GST", percentage: 18, amount: 500 },
      { type: "Service Tax", percentage: 5, amount: 200 },
    ],
  })
  @IsArray()
  taxes: Array<{
    type: string;
    percentage: number;
    amount: number;
  }>;

  @ApiProperty({ description: "Currency code (ISO 4217)", example: "INR" })
  @IsString()
  currency: string;

  @ApiProperty({ description: "Total amount before discount", example: 5000.0 })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ description: "Discount amount", example: 500.0, default: 0 })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiProperty({
    description: "Final amount after discount",
    example: 4500.0,
  })
  @IsNumber()
  finalAmount: number;

  @ApiProperty({
    description: "Discount details if any",
    required: false,
    example: {
      discountCode: "SUMMER2025",
      discountType: "percentage",
      discountValue: 10,
      discountDescription: "10% off on all bookings",
      minimumAmount: 2000,
      maximumDiscount: 1000,
    },
  })
  @IsOptional()
  @IsObject()
  discountDetails?: {
    discountCode: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountDescription?: string;
    minimumAmount?: number;
    maximumDiscount?: number;
  };

  @ApiProperty({
    description: "Order status",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ description: "Additional notes", required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: "Additional details (custom metadata)",
    required: false,
  })
  @IsOptional()
  @IsObject()
  additionalDetails?: Record<string, any>;

  @ApiProperty({
    description: "Risk analysis details",
    required: false,
  })
  @IsOptional()
  @IsObject()
  riskDetails?: Record<string, any>;

  @ApiProperty({
    description: "Conversion summary",
    required: false,
  })
  @IsOptional()
  @IsObject()
  conversionSummary?: Record<string, any>;

  @ApiProperty({
    description: "Communication channels used",
    example: ["email", "sms"],
    required: false,
  })
  @IsOptional()
  @IsArray()
  communicationChannels?: string[];

  @ApiProperty({
    description: "Tags related to order",
    example: ["VIP", "HolidayBooking"],
    required: false,
  })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({
    description: "List of ordered items (products/rooms)",
    type: [CreateOrderProductDto],
  })
  @IsArray()
  @Type(() => CreateOrderProductDto)
  orderItems: CreateOrderProductDto[];
}

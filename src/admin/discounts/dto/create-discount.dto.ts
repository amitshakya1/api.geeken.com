import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, IsUUID, IsNumber, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType, ApplicableOn } from '../../../common/entities/discount.entity';
import { DiscountStatus } from '../../../common/enums/discount-status.enum';

export class CreateDiscountDto {
    @ApiProperty({ example: 'July End Offer' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: '15% off on all orders above ₹1000' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ enum: DiscountType, example: 'percentage' })
    @IsNotEmpty()
    @IsEnum(DiscountType)
    type: DiscountType;

    @ApiProperty({ example: 15 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    value?: number;

    @ApiPropertyOptional({
        type: [String],
        example: ['uuid1', 'uuid2'],
        description: 'Array of product UUIDs that user must buy (for buy_x_get_y types)'
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    eligibleProductIds?: string[];

    @ApiPropertyOptional({
        type: [String],
        example: ['uuid3', 'uuid4'],
        description: 'Array of product UUIDs that user will get free (for buy_x_get_y_free type)'
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    freeProductIds?: string[];

    @ApiPropertyOptional({ example: 2, description: 'Required for buy_x_get_y types' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    buyQuantity?: number;

    @ApiPropertyOptional({ example: 1, description: 'Required for buy_x_get_y types' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    getQuantity?: number;

    @ApiPropertyOptional({ example: 1000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minimumOrderValue?: number;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isMaximumDiscountValue?: boolean;

    @ApiPropertyOptional({ example: 500 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    maximumDiscountValue?: number;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isUsageLimitPerUser?: boolean;

    @ApiPropertyOptional({ example: 1, description: "Maximum times a single user can use this discount" })
    @IsOptional()
    @IsNumber()
    @Min(0)
    usageLimitPerUser?: number;

    @ApiPropertyOptional({ enum: ApplicableOn, example: 'allProducts' })
    @IsOptional()
    @IsEnum(ApplicableOn)
    applicableOn?: ApplicableOn;

    @ApiProperty({ example: '2025-07-28T00:00:00+05:30' })
    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2025-07-31T23:59:59+05:30' })
    @IsNotEmpty()
    @IsDateString()
    endDate: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    usageLimit?: number;


    @ApiPropertyOptional({ enum: DiscountStatus, example: 'active' })
    @IsOptional()
    @IsEnum(DiscountStatus)
    status?: DiscountStatus;

    @ApiPropertyOptional({ example: 'JULY15' })
    @IsOptional()
    @IsString()
    promoCode?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isAutoApply?: boolean;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isLimitedTime?: boolean;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isExclusive?: boolean;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isFreeShipping?: boolean;

    @ApiPropertyOptional({ example: 2, description: 'Optional cap for how many times buy_x_get_y can apply' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    maxApplicationsPerOrder?: number;

    @ApiPropertyOptional({
        type: [String],
        example: ['uuid1', 'uuid2', 'uuid3'],
        description: 'Array of product UUIDs to associate with the discount'
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    productIds?: string[];

    @ApiPropertyOptional({
        type: [String],
        example: ['uuid1', 'uuid2', 'uuid3'],
        description: 'Array of collection UUIDs to associate with the discount'
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    collectionIds?: string[];
} 
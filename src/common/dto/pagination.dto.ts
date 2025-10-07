import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EnquiryType } from '../entities/enquiry.entity';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'active, inactive, and etc.' })
  @IsOptional()
  status?: string;

}

export class PaginationWithRoleDto extends PaginationDto {

  @ApiPropertyOptional({ description: 'Filter by role name' })
  @IsOptional()
  @IsString()
  role?: string;
}

export class PaginationWithTypeDto extends PaginationDto {

  @ApiPropertyOptional({ description: 'Filter by type', enum: EnquiryType })
  @IsOptional()
  @IsEnum(EnquiryType)
  type: EnquiryType;
}

export class PaginationWithFileTypeDto extends PaginationDto {

  @ApiPropertyOptional({ description: 'Filter by mimeType name' })
  @IsOptional()
  @IsString()
  mimeType?: string;
}
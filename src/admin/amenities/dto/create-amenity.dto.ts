import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '../../../common/enums/status.enum';

export class CreateAmenityDto {
    @ApiProperty({ example: 'Wifi' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'High-speed wireless internet access' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ type: String, description: 'ID of the amenity category this amenity belongs to', example: 'uuid-here' })
    @IsNotEmpty()
    amenityCategoryId: string;

    @ApiPropertyOptional({ enum: EntityStatus, example: 'active' })
    @IsOptional()
    @IsEnum(EntityStatus)
    status?: EntityStatus;
} 
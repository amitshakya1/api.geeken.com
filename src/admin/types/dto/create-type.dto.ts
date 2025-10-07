import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '../../../common/enums/status.enum';

export class CreateTypeDto {
    @ApiProperty({ example: 'Electronics' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ enum: EntityStatus, example: 'active' })
    @IsOptional()
    @IsEnum(EntityStatus)
    status?: EntityStatus;
} 
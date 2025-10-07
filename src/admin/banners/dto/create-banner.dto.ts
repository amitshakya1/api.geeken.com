import { IsNotEmpty, IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '../../../common/enums/status.enum';

export class CreateBannerDto {
    @ApiProperty({ example: 'Homepage Banner' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'Welcome to our platform' })
    @IsOptional()
    @IsString()
    tagLine?: string;

    @ApiPropertyOptional({ example: 'Description of the banner' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 'uuid-of-mobile-image' })
    @IsNotEmpty()
    @IsUUID()
    mobileImageId: string;

    @ApiProperty({ example: 'uuid-of-desktop-image' })
    @IsNotEmpty()
    @IsUUID()
    desktopImageId: string;

    @ApiPropertyOptional({ enum: EntityStatus, example: 'active' })
    @IsOptional()
    @IsEnum(EntityStatus)
    status?: EntityStatus;
} 
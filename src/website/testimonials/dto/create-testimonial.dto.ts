import { IsNotEmpty, IsOptional, IsString, IsEnum, IsUUID, IsInt, Min, Max, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '../../../common/enums/status.enum';

export class CreateTestimonialDto {
    @ApiProperty({ example: 'John Doe' })
    @IsNotEmpty()
    @IsString()
    authorName: string;

    @ApiPropertyOptional({ example: 'Marketing Manager' })
    @IsOptional()
    @IsString()
    authorDesignation?: string;

    @ApiPropertyOptional({ example: 'Acme Inc.' })
    @IsOptional()
    @IsString()
    company?: string;

    @ApiProperty({ example: 'The service was excellent. Our team loved the support and quality.' })
    @IsNotEmpty()
    @IsString()
    message: string;

    @ApiProperty({ example: 4.5, minimum: 1, maximum: 5 })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiPropertyOptional({ example: 'uuid-of-image-file' })
    @IsOptional()
    @IsUUID()
    imageId?: string;

    @ApiPropertyOptional({ example: 'uuid-of-video-file' })
    @IsOptional()
    @IsUUID()
    videoId?: string;

    @ApiPropertyOptional({ example: 'website' })
    @IsOptional()
    @IsString()
    source?: string;

    @ApiPropertyOptional({ enum: EntityStatus, example: 'active' })
    @IsOptional()
    @IsEnum(EntityStatus)
    status?: EntityStatus;

} 
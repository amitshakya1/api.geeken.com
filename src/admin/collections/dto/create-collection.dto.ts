import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '../../../common/enums/status.enum';

export class CreateCollectionDto {
    @ApiProperty({ example: 'Business' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'Hotels catering to business travelers' })
    @IsOptional()
    @IsString()
    tagLine?: string;

    @ApiPropertyOptional({ example: 'Description of the collection' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'SEO title' })
    @IsOptional()
    @IsString()
    seoTitle?: string;

    @ApiPropertyOptional({ example: 'SEO keywords' })
    @IsOptional()
    @IsString()
    seoKeywords?: string;

    @ApiPropertyOptional({ example: 'SEO description' })
    @IsOptional()
    @IsString()
    seoDescription?: string;

    @ApiPropertyOptional({
        type: [String],
        example: ['uuid1', 'uuid2', 'uuid3'],
        description: 'Array of file UUIDs to associate with the collection'
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    fileIds?: string[];

    @ApiPropertyOptional({ enum: EntityStatus, example: 'active' })
    @IsOptional()
    @IsEnum(EntityStatus)
    status?: EntityStatus;
} 
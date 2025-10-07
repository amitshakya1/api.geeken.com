import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '../../../common/enums/status.enum';

export class CreatePageDto {
    @ApiProperty({ example: 'About Us Page' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'A page about our company' })
    @IsOptional()
    @IsString()
    tagLine?: string;

    @ApiPropertyOptional({ example: 'Description of the page' })
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
        description: 'Array of file UUIDs to associate with the page'
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
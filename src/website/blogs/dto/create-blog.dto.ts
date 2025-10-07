import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '../../../common/enums/status.enum';

export class CreateBlogDto {
    @ApiProperty({ example: 'Business Blog' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'A blog for business insights' })
    @IsOptional()
    @IsString()
    tagLine?: string;

    @ApiPropertyOptional({ example: 'Description of the blog' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        type: [String],
        description: "Array of category UUIDs to associate with the blog",
    })
    @IsOptional()
    @IsArray()
    @IsUUID("4", { each: true })
    categoryIds?: string[];

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
        description: 'Array of file UUIDs to associate with the blog'
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
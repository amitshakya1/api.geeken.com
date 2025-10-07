import { PartialType } from '@nestjs/swagger';
import { CreateCollectionDto } from './create-collection.dto';

export class UpdateCollectionDto extends PartialType(CreateCollectionDto) { }

//     @ApiPropertyOptional({ description: 'Name of the collection' })
//     @IsOptional()
//     @IsString()
//     name?: string;

//     @ApiPropertyOptional({ description: 'Tag line of the collection' })
//     @IsOptional()
//     @IsString()
//     tagLine?: string;

//     @ApiPropertyOptional({ description: 'Description of the collection' })
//     @IsOptional()
//     @IsString()
//     description?: string;

//     @ApiPropertyOptional({ description: 'SEO title' })
//     @IsOptional()
//     @IsString()
//     seoTitle?: string;

//     @ApiPropertyOptional({ description: 'SEO keywords' })
//     @IsOptional()
//     @IsString()
//     seoKeywords?: string;

//     @ApiPropertyOptional({ description: 'SEO description' })
//     @IsOptional()
//     @IsString()
//     seoDescription?: string;

//     @ApiPropertyOptional({ enum: CollectionStatus, description: 'Status of the collection' })
//     @IsOptional()
//     @IsEnum(CollectionStatus)
//     status?: CollectionStatus;
// } 
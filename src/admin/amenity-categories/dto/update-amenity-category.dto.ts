import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAmenityCategoryDto } from './create-amenity-category.dto';

export class UpdateAmenityCategoryDto extends PartialType(CreateAmenityCategoryDto) { } 
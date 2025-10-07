import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTypeDto } from './create-type.dto';

export class UpdateTypeDto extends PartialType(CreateTypeDto) { } 
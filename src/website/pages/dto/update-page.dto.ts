import { PartialType } from '@nestjs/swagger';
import { CreatePageDto } from './create-page.dto';
import { EntityStatusUpdate } from '../../../common/enums/status.enum';
import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';

export class UpdatePageDto extends PartialType(CreatePageDto) { }

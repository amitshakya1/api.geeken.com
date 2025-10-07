import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { EntityStatusUpdate } from '../../../common/enums/status.enum';

export class UpdateTestimonialStatusDto {
    @IsArray()
    @ArrayNotEmpty()
    ids: string[];

    @IsEnum(EntityStatusUpdate)
    status: EntityStatusUpdate;
}

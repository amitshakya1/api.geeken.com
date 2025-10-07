import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { EntityStatusUpdate } from '../../../common/enums/status.enum';

export class UpdateUserStatusDto {
    @IsArray()
    @ArrayNotEmpty()
    ids: string[];

    @IsEnum(EntityStatusUpdate)
    status: EntityStatusUpdate;
}

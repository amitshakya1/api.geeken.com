import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { EntityFileUpdate } from '../../../common/enums/status.enum';

export class UpdateFileStatusDto {
    @IsArray()
    @ArrayNotEmpty()
    ids: string[];

    @IsEnum(EntityFileUpdate)
    status: EntityFileUpdate;
}

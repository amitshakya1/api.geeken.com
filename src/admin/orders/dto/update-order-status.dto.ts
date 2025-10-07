import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { OrderStatus } from '../../../common/enums/order-status.enum';

export class UpdateOrderStatusDto {
    @IsArray()
    @ArrayNotEmpty()
    ids: string[];

    @IsEnum(OrderStatus)
    status: OrderStatus;
}

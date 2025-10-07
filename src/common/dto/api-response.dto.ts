import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data?: T;

  @ApiProperty()
  meta?: any;

  constructor(status: string, message: string, data?: T, meta?: any) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}
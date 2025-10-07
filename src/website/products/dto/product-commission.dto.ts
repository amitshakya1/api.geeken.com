import { IsString, IsOptional, IsUUID, IsInt } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProductCommissionDto {
  @ApiProperty({
    example: "uuid-here",
    description: "company address id on update",
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: "Product ID", type: "string", format: "uuid" })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: "Commission percentage or value",
    type: "number",
  })
  @IsInt()
  percentage: number;
}

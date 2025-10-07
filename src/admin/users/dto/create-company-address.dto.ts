import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateCompanyAddressDto {
  @ApiProperty({
    example: "uuid-here",
    description: "company address id on update",
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    example: "registered_office",
    description: "Address type",
    enum: ["registered_office", "correspondence", "billing"],
  })
  @IsString()
  @IsNotEmpty()
  type: "registered_office" | "correspondence" | "billing";

  @ApiProperty({ example: "123 Main St", description: "Address" })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: "New York", description: "City" })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: "NY", description: "State" })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: "10001", description: "Pincode" })
  @IsString()
  @IsNotEmpty()
  pincode: string;

  @ApiProperty({ example: "USA", description: "Country" })
  @IsString()
  @IsNotEmpty()
  country: string;
}

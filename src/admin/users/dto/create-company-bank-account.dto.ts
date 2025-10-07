import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCompanyBankAccountDto {
  @ApiProperty({
    example: "uuid-here",
    description: "company bank account id on update",
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: "Bank of America", description: "Bank Name" })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({ example: "1234567890", description: "Account Number" })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ example: "John Doe", description: "Account Holder Name" })
  @IsString()
  @IsNotEmpty()
  accountHolderName: string;

  @ApiProperty({ example: "BOFA0001234", description: "IFSC Code" })
  @IsString()
  @IsNotEmpty()
  ifscCode: string;

  @ApiProperty({ example: "john.doe@upi", description: "UPI Name" })
  @IsString()
  @IsNotEmpty()
  upiName: string;

  @ApiProperty({ example: "john.doe@okbank", description: "UPI Address" })
  @IsString()
  @IsNotEmpty()
  upiAddress: string;
}

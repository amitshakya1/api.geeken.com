import { IsNotEmpty, IsOptional, IsString, IsInt, IsIn, IsPositive, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const ALLOWED_MIME_TYPES = [
    /^image\//,
    /^application\/pdf$/,
    /^application\/msword$/,
    /^application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document$/,
    /^application\/vnd\.ms-excel$/,
    /^application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet$/,
];

function isAllowedMimeType(mime: string): boolean {
    return ALLOWED_MIME_TYPES.some((pattern) => pattern.test(mime));
}

export class CreateFileDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    altText: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    fileName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    // Custom validator for allowed mime types
    @Matches(/^image\//, { message: 'Only images, pdf, doc, docx, xls, xlsx are allowed', each: false })
    mimeType: string;

    @ApiProperty({ enum: ['local', 's3'] })
    @IsNotEmpty()
    @IsString()
    @IsIn(['local', 's3'])
    disk: string;

    @ApiProperty({ enum: ['local', 's3'] })
    @IsNotEmpty()
    @IsString()
    @IsIn(['local', 's3'])
    conversionsDisk: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    size: number;

    @ApiPropertyOptional({ type: 'object' })
    @IsOptional()
    generatedConversions?: any;

    @ApiPropertyOptional({ description: 'User ID who uploaded the file' })
    @IsOptional()
    userId?: string;
} 
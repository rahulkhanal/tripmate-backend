import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFeatureStatusDto {
    @ApiProperty({ description: 'Status of the feature', example: true })
    @IsBoolean()
    status: boolean;
}

export class UpdatePropertyDto {
    @ApiProperty({ example: 'Beautiful Beach House', description: 'Name of the property' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'Miami Beach, FL', description: 'Location of the property' })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiProperty({ example: true, description: 'Status of the property' })
    @IsBoolean()
    @IsOptional()
    verified?: boolean;

    @ApiProperty()
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({ description: 'Description of the property' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'price of the property' })
    @IsString()
    @IsOptional()
    price?: string;
}
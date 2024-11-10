import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsArray, ValidateNested, IsNumber, IsOptional } from 'class-validator';

class FeatureStatusDto {
    @ApiProperty({ example: 1, description: 'The ID of the feature' })
    @IsNumber()
    featureId: number;

    @ApiProperty({ example: true, description: 'Status of the feature (true = available, false = not available)' })
    @IsBoolean()
    status: boolean;
}

export class CreatePropertyDto {
    @IsString()
    @ApiProperty()
    name: string;

    @IsString()
    @ApiProperty()
    category: string;

    @IsString()
    @ApiProperty()
    location: string;

    @IsNumber()
    @ApiProperty()
    price: number; 

    @IsString()
    @ApiProperty({ description: 'Description of the property' })
    description: string;

    @ApiProperty({ type: 'string', format: 'binary' })
    imgUrl: File;

    @ApiProperty({ type: 'string', format: 'binary' })
    imgDocUrl: File;

    @ApiProperty({
        description: 'An array of feature objects, each containing featureId and status',
        example: [
            { featureId: 1, status: true },
            { featureId: 2, status: false },
            { featureId: 3, status: true },
            { featureId: 4, status: false },
            { featureId: 5, status: true },
            { featureId: 6, status: false },
            { featureId: 7, status: true },
            { featureId: 8, status: false },
            { featureId: 9, status: true },
            { featureId: 10, status: false },
        ],
    })

    @IsArray()
    @ValidateNested({ each: true })
    @ApiProperty({ type: 'array' })
    @Type(() => FeatureStatusDto)
    features: FeatureStatusDto[];
}
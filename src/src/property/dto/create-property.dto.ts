import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsArray, ValidateNested, IsNumber } from 'class-validator';

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

    @IsString()
    @ApiProperty({ description: 'Description of the property' })
    description: string;

    // @IsArray()
    // @ApiProperty()
    // features: { featureId: number; status: boolean }[];

    @ApiProperty({
        type: [FeatureStatusDto],
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
    @Type(() => FeatureStatusDto)
    features: FeatureStatusDto[];
}


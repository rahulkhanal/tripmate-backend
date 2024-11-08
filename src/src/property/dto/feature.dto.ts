import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator";

class FeatureDto {
    @ApiProperty({ example: 'WiFi', description: 'The name of the feature' })
    @IsString()
    name: string;
  }
  
  export class CreateFeaturesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FeatureDto)
    @ApiProperty({
        type: [FeatureDto],
        description: 'Array of features to create',
        example: [
          { "name": "WiFi" },
          { "name": "Swimming Pool" },
          { "name": "Air Conditioning" },
          { "name": "Gym" },
          { "name": "Free Parking" },
          { "name": "Breakfast Included" },
          { "name": "Pet Friendly" },
          { "name": "Spa Services" },
          { "name": "24-Hour Reception" },
          { "name": "Restaurant" }
        ],
      })
    features: FeatureDto[];
  }
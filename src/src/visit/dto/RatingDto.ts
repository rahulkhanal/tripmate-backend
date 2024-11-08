import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Max, Min } from "class-validator";

export class RatingDto {
    @IsNumber()
    @Min(1)
    @Max(5)
    @ApiProperty({ example: '1-5' })
    rating_score: number;

    @IsString()
    @ApiProperty()
    review: string;

    @IsNumber()
    @ApiProperty()
    property: number;

    @IsNumber()
    @ApiProperty()
    visit: number;
}
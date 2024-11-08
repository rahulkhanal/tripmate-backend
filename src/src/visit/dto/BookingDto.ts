import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class BookingDto {
    @IsNumber()
    @ApiProperty()
    propertyId: number;

    @IsString()
    @ApiProperty({ example: '2022-01-01' })
    startDate: Date;

    @IsString()
    @ApiProperty({ example: '2022-01-02' })
    endDate: Date;
}

enum bookingStatus {
    booked = 'booked',
    visited = 'visited',
    cancelled = 'cancelled',
}


export class updateBookingDto {
    @IsNumber()
    @ApiProperty()
    @IsOptional()
    propertyId?: number;

    @IsEnum(bookingStatus)
    @ApiProperty({ example: bookingStatus })
    @IsOptional()
    status?: bookingStatus;

    @IsDateString()
    @ApiProperty({ example: '2022-01-01' })
    @IsOptional()
    startDate?: Date;

    @IsDateString()
    @ApiProperty({ example: '2022-01-02' })
    @IsOptional()
    endDate?: Date;
}
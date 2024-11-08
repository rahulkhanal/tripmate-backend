import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class MailDto {
    @IsEmail()
    @ApiProperty()
    to: string;

    @IsString()
    @ApiProperty()
    body: string;
}
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class RegisterUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    photo?: string;
}

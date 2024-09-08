import { IsEmail, IsString, MinLength } from "class-validator";

export class SignUpDto {
    @IsString()
    @MinLength(3)
    nickname: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

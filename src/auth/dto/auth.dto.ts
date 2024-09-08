import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class SignUpDto {
    @IsString()
    @Transform(({ value }) => value.trim())
    @MinLength(3)
    nickname: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}

export class LoginDto {
    @IsString()
    @Transform(({ value }) => value.trim())
    nickname: string;

    @IsString()
    password: string;
}

import { Transform } from "class-transformer";
import {
    IsEmail,
    IsString,
    IsStrongPassword,
    Length,
    IsOptional,
    ValidateIf,
    IsISO31661Alpha2,
} from "class-validator";

const strongPasswordOptions = {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
};

export class SignUpDto {
    @IsString()
    @Transform(({ value }) => value?.trim())
    @Length(3, 20)
    nickname: string;

    @IsEmail()
    email: string;

    @IsStrongPassword(strongPasswordOptions)
    password: string;

    @IsISO31661Alpha2()
    countryCode: string;
}

// login dto
const nicknameOrEmailMessage = { message: "Nickname or email is required" };

export class LoginDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.trim())
    @Length(3, 20)
    @ValidateIf((o) => !o.email, nicknameOrEmailMessage)
    nickname?: string;

    @IsOptional()
    @ValidateIf((o) => !o.nickname, nicknameOrEmailMessage)
    @IsEmail()
    email?: string;

    // Yo don't need to validate password here, since it's already store
    @IsString()
    password: string;
}

export class forgotPasswordDto {
    @IsEmail()
    email: string;
}

export class resetPasswordDto {
    @IsString()
    token: string;

    @IsStrongPassword(strongPasswordOptions)
    newPassword: string;
}

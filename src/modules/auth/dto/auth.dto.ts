import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
    IsEmail,
    IsString,
    IsStrongPassword,
    Length,
    IsOptional,
    ValidateIf,
    IsISO31661Alpha2,
    IsJWT,
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
    @ApiProperty({ example: "John Doe" })
    nickname: string;

    @IsEmail()
    @ApiProperty({ example: "example@example.com" })
    email: string;

    @IsStrongPassword(strongPasswordOptions)
    @ApiProperty({ example: "Jh0n_d0e" })
    password: string;

    @IsISO31661Alpha2()
    @ApiProperty({ example: "CO" })
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
    @ApiPropertyOptional({
        description:
            "Nickname of the user. Either nickname or email must be provided, but not both.",
    })
    nickname?: string;

    @IsOptional()
    @ValidateIf((o) => !o.nickname, nicknameOrEmailMessage)
    @IsEmail()
    @ApiPropertyOptional({
        description:
            "Email of the user. Either nickname or email must be provided, but not both.",
    })
    email?: string;

    // Already validated in SignUpDto
    @IsString()
    password: string;
}

export class forgotPasswordDto {
    @IsEmail()
    email: string;
}

export class resetPasswordDto {
    @IsJWT()
    token: string;

    @IsStrongPassword(strongPasswordOptions)
    newPassword: string;
}

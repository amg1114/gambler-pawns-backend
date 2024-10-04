import { Controller, Post, Body, HttpCode, Patch } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
    SignUpDto,
    LoginDto,
    forgotPasswordDto,
    resetPasswordDto,
} from "./dto/auth.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
    SignUpResponse201Dto,
    SignUpResponse400Dto,
    SignUpResponse409Dto,
} from "./dto/responses/signUpResponses.dto";
import {
    LogInResponse200Dto,
    LogInResponse400Dto,
    LogInResponse401Dto,
} from "./dto/responses/logInResponses.dto";
import {
    ForgotPasswordResponse200Dto,
    ForgotPasswordResponse400Dto,
} from "./dto/responses/forgotPasswordResponses.dto";
import { ForgotPasswordResponse401Dto } from "./dto/responses/resetPasswordResponses.dto";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    // Sign up endpoint
    @Post("signup")
    @ApiOperation({ summary: "Sign up" })
    @ApiResponse({
        status: 201,
        description: "User registered successfully",
        type: SignUpResponse201Dto,
    })
    @ApiResponse({
        status: 400,
        description: "Validation error",
        type: SignUpResponse400Dto,
    })
    @ApiResponse({
        status: 409,
        description: "User or email is already registered",
        type: SignUpResponse409Dto,
    })
    signUp(@Body() body: SignUpDto) {
        return this.authService.signUp(body);
    }

    // Log in endpoint
    @Post("login")
    @HttpCode(200)
    @ApiOperation({ summary: "Log in" })
    @ApiResponse({
        status: 200,
        description: "User logged in",
        type: LogInResponse200Dto,
    })
    @ApiResponse({
        status: 400,
        description: "Validation error",
        type: LogInResponse400Dto,
    })
    @ApiResponse({
        status: 401,
        description: "Wrong credentials",
        type: LogInResponse401Dto,
    })
    login(@Body() body: LoginDto) {
        return this.authService.login(body);
    }

    // Forgot password endpoint
    @Post("forgot-password")
    @HttpCode(200)
    @ApiOperation({ summary: "Forgot password" })
    @ApiResponse({
        status: 200,
        description: "Password reset email sent",
        type: ForgotPasswordResponse200Dto,
    })
    @ApiResponse({
        status: 400,
        description: "Validation error",
        type: ForgotPasswordResponse400Dto,
    })
    forgotPassword(@Body() body: forgotPasswordDto) {
        return this.authService.forgotPassword(body);
    }

    // Reset password endpoint
    @Patch("reset-password")
    @HttpCode(200)
    @ApiOperation({ summary: "Reset password" })
    @ApiResponse({
        status: 200,
        description: "Password reset successfully",
        type: ForgotPasswordResponse200Dto,
    })
    @ApiResponse({
        status: 400,
        description: "Validation error",
        type: ForgotPasswordResponse400Dto,
    })
    @ApiResponse({
        status: 401,
        description: "Wrong credentials or invalid token",
        type: ForgotPasswordResponse401Dto,
    })
    resetPassword(@Body() body: resetPasswordDto) {
        return this.authService.resetPassword(body);
    }
}

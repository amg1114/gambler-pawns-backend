import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto, LoginDto } from "./dto/auth.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: "Sign up" })
    @ApiResponse({ status: 201, description: "User registered succesfully" })
    @ApiResponse({
        status: 409,
        description: "User or email is already registered",
    })
    @ApiResponse({ status: 400, description: "Validation error" })
    @Post("signup")
    signUp(@Body() signUpDto: SignUpDto) {
        return this.authService.signUp(signUpDto);
    }

    @ApiOperation({ summary: "Log in" })
    @ApiResponse({ status: 200, description: "User logged in" })
    @ApiResponse({ status: 401, description: "Wrong credentials" })
    @ApiResponse({ status: 400, description: "Validation error" })
    @Post("login")
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}

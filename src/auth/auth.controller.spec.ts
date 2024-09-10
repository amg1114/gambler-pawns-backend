import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SignUpDto, LoginDto } from "./dto/auth.dto";

describe("AuthController", () => {
    let controller: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        signUp: jest.fn(),
                        login: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("signUp", () => {
        it("should call authService.signUp with SignUpDto", async () => {
            const signUpDto: SignUpDto = {
                nickname: "testuser",
                email: "test@example.com",
                password: "password123",
                countryCode: "US",
            };
            await controller.signUp(signUpDto);
            expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
        });
    });

    describe("login", () => {
        it("should call authService.login with LoginDto", async () => {
            const loginDto: LoginDto = {
                nickname: "testuser",
                password: "password123",
            };
            await controller.login(loginDto);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });
});

import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { DRIZZLE } from "../drizzle/drizzle.module";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
    let service: AuthService;
    let jwtService: JwtService;
    let drizzleMock: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                    },
                },
                {
                    provide: DRIZZLE,
                    useValue: {
                        select: jest.fn().mockReturnThis(),
                        from: jest.fn().mockReturnThis(),
                        where: jest.fn().mockReturnThis(),
                        limit: jest.fn().mockReturnThis(),
                        insert: jest.fn().mockReturnThis(),
                        values: jest.fn().mockReturnThis(),
                        returning: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
        drizzleMock = module.get(DRIZZLE);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("signUp", () => {
        it("should throw ConflictException if user exists", async () => {
            drizzleMock.returning.mockResolvedValue([{}]);
            await expect(
                service.signUp({
                    nickname: "existinguser",
                    email: "existing@example.com",
                    password: "password123",
                    countryCode: "US",
                }),
            ).rejects.toThrow(ConflictException);
        });

        it("should create a new user and return token", async () => {
            drizzleMock.returning.mockResolvedValue([]);
            drizzleMock
                .insert()
                .values()
                .returning.mockResolvedValue([{ id: 1 }]);
            jest.spyOn(bcrypt, "hash").mockResolvedValue(
                "hashedPassword" as never,
            );
            jest.spyOn(service as any, "generateToken").mockReturnValue({
                access_token: "token",
            });

            const result = await service.signUp({
                nickname: "newuser",
                email: "new@example.com",
                password: "password123",
                countryCode: "US",
            });

            expect(result).toEqual({ access_token: "token" });
        });
    });

    describe("login", () => {
        it("should throw UnauthorizedException if user not found", async () => {
            drizzleMock.returning.mockResolvedValue([]);
            await expect(
                service.login({
                    nickname: "nonexistent",
                    password: "password123",
                }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it("should throw UnauthorizedException if password is invalid", async () => {
            drizzleMock.returning.mockResolvedValue([
                { password: "hashedPassword" },
            ]);
            jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);
            await expect(
                service.login({
                    nickname: "existinguser",
                    password: "wrongpassword",
                }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it("should return token if credentials are valid", async () => {
            drizzleMock.returning.mockResolvedValue([
                { id: 1, password: "hashedPassword" },
            ]);
            jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
            jest.spyOn(service as any, "generateToken").mockReturnValue({
                access_token: "token",
            });

            const result = await service.login({
                nickname: "existinguser",
                password: "correctpassword",
            });

            expect(result).toEqual({ access_token: "token" });
        });
    });
});

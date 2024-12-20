import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import {
    SignUpDto,
    LoginDto,
    forgotPasswordDto,
    resetPasswordDto,
    UpdatePasswordDto,
} from "./dto/auth.dto";
import { randomInt } from "crypto";
import { MailerService } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";
import { UserService } from "src/modules/user/user.service";
import { UserAvatarImg } from "src/modules/user/entities/userAvatar.entity";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(UserAvatarImg)
        private userAvatarImgRepository: Repository<UserAvatarImg>,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
        private userService: UserService,
    ) {}

    async signUp({ nickname, email, password, countryCode }: SignUpDto) {
        // 1. validate user does not exist
        const user = await this.userService.findOneByEmailOrNickname(
            email,
            nickname,
        );
        if (user) {
            throw new ConflictException(
                "Nickname or email is already registered",
            );
        }

        // 2. hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. insert user in database
        const newUser = this.userRepository.create({
            nickname,
            email,
            password: hashedPassword,
            countryCode,
            aboutText: "",
            userAvatarImg: { userAvatarImgId: randomInt(1, 26) },
            eloRapid: 1500,
            eloBlitz: 1500,
            eloBullet: 1500,
            eloArcade: 1500,
            currentCoins: 100,
            acumulatedAllTimeCoins: 100,
        });
        await this.userRepository.save(newUser);

        // return object
        return this.generateToken(newUser);
    }

    async login({ nickname, email, password }: LoginDto) {
        // 1. validar que el usuario existe por email o nickname
        const user = nickname
            ? await this.userRepository
                  .createQueryBuilder("user")
                  .addSelect("user.password")
                  .leftJoinAndSelect("user.userAvatarImg", "userAvatarImg")
                  .where("user.nickname = :nickname", { nickname })
                  .getOne()
            : await this.userRepository
                  .createQueryBuilder("user")
                  .addSelect("user.password")
                  .leftJoinAndSelect("user.userAvatarImg", "userAvatarImg")
                  .where("user.email = :email", { email })
                  .getOne();

        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // 2. validar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // 3. devolver el token
        return this.generateToken(user);
    }

    private generateToken({ password, ...userWithoutPassword }: User) {
        return {
            access_token: this.jwtService.sign({
                sub: userWithoutPassword.userId,
                ...userWithoutPassword,
            }),
        };
    }

    async forgotPassword({ email }: forgotPasswordDto) {
        const token = this.jwtService.sign(
            { email: email },
            { expiresIn: "10m" },
        );

        const domain = this.configService.getOrThrow("FRONTEND_DOMAIN");
        const link = `${domain}/reset-password?token=${token}`;
        const msg = {
            from:
                "Gambler Pawns <" +
                this.configService.getOrThrow("NODEMAILER_EMAIL") +
                ">",
            to: email,
            subject: "Password reset request",
            html: `
                You have requested a password reset email.<br><br>

                Please, <a href="${link}">click here</a> 
                to proceed with the password recovery process or copy and paste the following link. 
                Keep in mind that the process invalidates itself after 10 minutes.<br><br>
                ${link}
                `,
        };

        await this.mailerService.sendMail(msg).catch(() => {
            throw new InternalServerErrorException("Failed to send email");
        });

        return;
    }

    async resetPassword({ token, newPassword }: resetPasswordDto) {
        let email: string;
        try {
            const data = await this.jwtService.verifyAsync(token);
            email = data.email;
        } catch (error) {
            throw new UnauthorizedException("Invalid token");
        }
        const user = await this.userService.findOneByEmail(email);
        if (!user) throw new UnauthorizedException("Invalid credentials");

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await this.userRepository.save(user);
    }

    async updatePassword(userId: number, passwordFields: UpdatePasswordDto) {
        const user = await this.userRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.userId = :userId", { userId })
            .getOne();

        if (!user) {
            throw new NotFoundException("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
            passwordFields.currentPassword,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException("Password is incorrect");
        }

        const hashedPassword = await bcrypt.hash(
            passwordFields.newPassword,
            10,
        );

        return this.userRepository.update(userId, { password: hashedPassword });
    }
}

import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    InternalServerErrorException,
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

        // get random avatar for new user
        const avatar = await this.userAvatarImgRepository.findOne({
            where: { userAvatarImgId: randomInt(1, 26) }, // Cambia el campo de búsqueda por el correcto
        });
        // 3. insert user in database
        const newUser = this.userRepository.create({
            nickname,
            email,
            password: hashedPassword,
            countryCode,
            aboutText: "",
            userAvatarImg: avatar,
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
            ? await this.userService.findOneByNickname(nickname)
            : await this.userService.findOneByEmail(email);

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

    private generateToken(user: User) {
        return {
            access_token: this.jwtService.sign({
                sub: user.userId,
                ...user,
            }),
        };
    }

    async forgotPassword({ email }: forgotPasswordDto) {
        const token = this.jwtService.sign(
            { email: email },
            { expiresIn: "10m" },
        );

        //TODO: write a better email html+css template
        const msg = {
            from:
                "Gambler Pawns <" +
                this.configService.getOrThrow("NODEMAILER_EMAIL") +
                ">",
            to: email,
            subject: "Password reset",
            html: "Your requested password reset token is: " + token,
        };

        await this.mailerService.sendMail(msg).catch(() => {
            throw new InternalServerErrorException("Failed to send email");
        });

        // This return must be changed so the response doesnt return the token since it will be only accessible by the user's email
        // This is just for debugging/development purposes
        return { token: token };
    }

    async resetPassword({ token, newPassword }: resetPasswordDto) {
        let email: string;
        try {
            email = this.jwtService.verify(token).email;
        } catch (error) {
            throw new UnauthorizedException("Invalid token");
        }
        const user = await this.userService.findOneByEmail(email);

        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await this.userRepository.save(user);
    }
}

import {
    Injectable,
    UnauthorizedException,
    Inject,
    ConflictException,
    InternalServerErrorException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { sql } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import {
    SignUpDto,
    LoginDto,
    forgotPasswordDto,
    resetPasswordDto,
} from "./dto/auth.dto";
import { DrizzleAsyncProvider } from "../drizzle/drizzle.provider";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema";
import { randomInt } from "crypto";
import { MailerService } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) {}

    async signUp({ nickname, email, password, countryCode }: SignUpDto) {
        // 1. validate user does not exist
        const user = await this.db
            .select()
            .from(schema.users)
            .where(
                sql` ${schema.users.email} = ${email} OR ${schema.users.nickname} = ${nickname} `,
            )
            .limit(1);

        if (user.length > 0) {
            throw new ConflictException(
                "Nickname or email is already registered",
            );
        }

        // 2. hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. insert user in database
        const newUser = await this.db
            .insert(schema.users)
            .values({
                nickname: nickname,
                email: email,
                password: hashedPassword,
                countryCode: countryCode,
                about: "",
                fkUserAvatarImgId: randomInt(1, 26), // random
                eloRapid: 1500,
                eloBlitz: 1500,
                eloBullet: 1500,
                eloArcade: 1500,
                currentCoins: 0,
                acumulatedAlltimeCoins: 0,
            })
            .returning();

        // return object
        return this.generateToken(newUser[0]);
    }

    async login({ nickname, email, password }: LoginDto) {
        // 1. validate user exists using email or nickname
        const queryCondition =
            nickname !== undefined
                ? sql` ${schema.users.nickname} = ${nickname} `
                : sql` ${schema.users.email} = ${email} `;
        const user = await this.db
            .select()
            .from(schema.users)
            .where(queryCondition)
            .limit(1);

        if (user.length === 0)
            throw new UnauthorizedException("Invalid credentials");

        // 2. validate password
        const isPasswordValid = await bcrypt.compare(
            password,
            user[0].password,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }
        // 3. return token
        return this.generateToken(user[0]);
    }

    private generateToken(user: typeof schema.users.$inferSelect) {
        delete user.password;
        delete user.dateOfBirth;
        return {
            access_token: this.jwtService.sign(user),
        };
    }

    async forgotPassword({ email }: forgotPasswordDto) {
        const token = this.jwtService.sign(
            { email: email },
            { expiresIn: "30s" },
        );

        //TODO: write a better email
        const msg = {
            from:
                "Gambler Pawns <" +
                this.configService.get("NODEMAILER_EMAIL") +
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

        const user = await this.db
            .select()
            .from(schema.users)
            .where(sql` ${schema.users.email} = ${email} `)
            .limit(1);

        if (user.length === 0)
            throw new UnauthorizedException("Invalid credentials");

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.db
            .update(schema.users)
            .set({ password: hashedPassword })
            .where(sql` ${schema.users.email} = ${email} `)
            .execute();
    }
}

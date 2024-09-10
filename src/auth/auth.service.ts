import {
    Injectable,
    UnauthorizedException,
    Inject,
    ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { sql } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import { SignUpDto, LoginDto } from "./dto/auth.dto";
import { DRIZZLE } from "../drizzle/drizzle.module";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema";
import { randomInt } from "crypto";

@Injectable()
export class AuthService {
    constructor(
        @Inject(DRIZZLE) private drizzle: NodePgDatabase<typeof schema>,
        private jwtService: JwtService,
    ) {}

    async signUp({ nickname, email, password, countryCode }: SignUpDto) {
        // 1. validate user does not exist
        const user = await this.drizzle
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
        const newUser = await this.drizzle
            .insert(schema.users)
            .values({
                nickname: nickname,
                email: email,
                password: hashedPassword,
                //countryCode: countryCode,
                eloRapid: 1500,
                eloBlitz: 1500,
                eloBullet: 1500,
                eloArcade: 1500,
                currentCoins: 0,
                acumulatedAlltimeCoins: 0,
                fkUserAvatarImgId: randomInt(1, 26), // random avatar
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
        const user = await this.drizzle
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
}

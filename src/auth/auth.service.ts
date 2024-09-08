import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
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

    async signUp({ nickname, email, password }: SignUpDto) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.drizzle
            .insert(schema.users)
            .values({
                nickname: nickname,
                email: email,
                password: hashedPassword,
                dateOfBirth: null,
                eloRapid: 1500,
                eloBlitz: 1500,
                eloBullet: 1500,
                eloArcade: 1500,
                currentCoins: 0,
                acumulatedAlltimeCoins: 0,
                fkUserAvatarImgId: randomInt(1, 26), // Assuming a default avatar
            })
            .returning();

        return this.generateToken(newUser[0]);
    }

    async login({ nickname, password }: LoginDto) {
        const user = await this.drizzle
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, nickname))
            .limit(1);

        if (user.length === 0)
            throw new UnauthorizedException("Invalid credentials");

        const isPasswordValid = await bcrypt.compare(
            password,
            user[0].password,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }

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

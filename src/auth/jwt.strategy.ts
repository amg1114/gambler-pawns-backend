import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DrizzleService } from '../drizzle/drizzle.service';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private drizzle: DrizzleService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.userId, payload.sub))
      .limit(1);
    if (user.length === 0) {
      throw new UnauthorizedException();
    }
    return user[0];
  }
}

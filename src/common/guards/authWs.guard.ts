import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class AuthWsGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext) {
        const client = context.switchToWs().getClient();
        const token = this.extractTokenFromHandshake(client);
        if (!token) throw new WsException("Unauthorized");

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.getOrThrow<string>("JWT_SECRET"),
            });
            // Attach the user object to the client object
            client.user = payload;
        } catch (error) {
            throw new WsException("Invalid token");
        }
        return true;
    }

    private extractTokenFromHandshake(client: any): string | null {
        const token = client.handshake?.auth?.token;
        return token ? token : null;
    }
}

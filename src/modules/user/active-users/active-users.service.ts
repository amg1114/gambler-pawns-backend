import { Injectable } from "@nestjs/common";

@Injectable()
export class ActiveUsersService {
    public activeUsers = new Map<number, string>(); // userId -> socket.id
    public activeUsersReverse = new Map<string, number>(); // socket.id -> userId

    addActiveUser(userId: number, socketId: string) {
        this.activeUsers.set(userId, socketId);
        this.activeUsersReverse.set(socketId, userId);
    }

    removeActiveUser(socketId: string) {
        const userId = this.activeUsersReverse.get(socketId);
        this.activeUsersReverse.delete(socketId);
        this.activeUsers.delete(userId);
    }
}

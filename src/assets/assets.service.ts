import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import * as schema from "../drizzle/schema";
import { sql } from "drizzle-orm";

@Injectable()
export class AssetsService {
    constructor(@Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>) {}

    /**
     * Get the avatar image path
     * @param id The avatar image id
     * @returns The avatar image path
     * @throws Error if the avatar image is not found 
     */
    async getAvatar(id: string): Promise<string> {
        const path = await this.db
        .select()
        .from(schema.userAvatarImg)
        .where(sql`${schema.userAvatarImg.userAvatarImgId} = ${id}`)
        .limit(1);

        if (path.length === 0) {
           throw new NotFoundException("Avatar not found");
        }

        return `public/user_avatars/${path[0].fileName}`;
    }

    async getAvatarList() {
        return await this.db
        .select()
        .from(schema.userAvatarImg)
        .orderBy(schema.userAvatarImg.userAvatarImgId);
    }
}

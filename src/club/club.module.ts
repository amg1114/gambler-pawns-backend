import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Club } from "./entities/club.entity";
import { UserInClub } from "./entities/userInClub.entity";
import { ClubPost } from "./entities/clubPost.entity";
import { ClubPostComment } from "./entities/clubPostComment.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Club, ClubPost, UserInClub, ClubPostComment]),
    ],
})
export class ClubModule {}

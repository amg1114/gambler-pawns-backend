import { Game } from "./entities/game";
import { Player } from "./entities/interfaces/player";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game as GameEntity } from "./entities/db/game.entity";
import { GameMode } from "./entities/db/gameMode.entity";
import { User } from "../user/entities/user.entity";
import { GameLinkService } from "./gameLink/gameLink.service";

@Injectable()
export class GameChessManagerService {
    
}

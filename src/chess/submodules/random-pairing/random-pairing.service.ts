import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ActiveGamesService } from "../active-games/active-games.service";
import { GameLinkService } from "../game-link/game-link.service";
// entities
import { User } from "src/user/entities/user.entity";
import { Game as GameEntity } from "../../entities/db/game.entity";
import { GameMode } from "../../entities/db/gameMode.entity";

// interfaces and types
import { Player } from "../../entities/interfaces/player";

// models
import { Game } from "../../entities/game";

@Injectable()
export class RandomPairingService {
    private rapidPool: Player[] = [];
    private blitzPool: Player[] = [];
    private bulletPool: Player[] = [];

    constructor(
        private gameLinkService: GameLinkService,
        private chessService: ActiveGamesService,
        @InjectRepository(GameEntity)
        private gameEntityRepository: Repository<GameEntity>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(GameMode)
        private gameModeRepository: Repository<GameMode>,
    ) {}

    async addToPool(player: Player, mode: "rapid" | "blitz" | "bullet") {
        const pool = this.getPoolByMode(mode);
        pool.push(player);
        return await this.tryToPairPlayers(mode);
    }

    async tryToPairPlayers(mode: "rapid" | "blitz" | "bullet") {
        const pool = this.getPoolByMode(mode);
        // TODO: agregar logica setTimeOut para esperar a que la pool tenga más jugadores +-5s

        if (pool.length < 2) return;

        // sort array by elo
        pool.sort((a, b) => a.eloRating - b.eloRating);

        // pairing first two players in sorted array by elo
        const player1 = pool.shift();
        const player2 = pool.shift();

        if (player1 && player2) {
            // creating new game and callign createGameInDB in order to insert data in db
            const newGame = new Game(
                mode,
                this.gameEntityRepository,
                this.userRepository,
                this.gameModeRepository,
            );
            // TODO: mirar como se refactoriza mejor esto
            await newGame.createGameInDB(player1.playerId, player2.playerId);
            const gameId = this.gameLinkService.genGameLinkEncodeByGameId(
                +newGame.gameId,
            );
            newGame.gameId = gameId;
            // save game in memory (HashMap)
            this.chessService.setActiveGame(player1.playerId, newGame);
            this.chessService.setActiveGame(player2.playerId, newGame);
            return {
                gameId: gameId,
                player1Socket: player1.socketId,
                player2Socket: player2.socketId,
                playerWhite: newGame.whitesPlayer,
                playerBlack: newGame.blacksPlayer,
            };
        }
    }
    getPoolByMode(mode: "rapid" | "blitz" | "bullet") {
        return this[`${mode}Pool`];
    }
}

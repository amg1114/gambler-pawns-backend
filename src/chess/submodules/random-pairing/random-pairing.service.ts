import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ActiveGamesService } from "../active-games/active-games.service";
import { GameLinkService } from "../game-link/game-link.service";
// entities
import { User } from "src/user/entities/user.entity";
import { GameModeType } from "../../entities/db/game.entity";

// interfaces and types
import { Player } from "../../entities/interfaces/player";

// models
import { Game } from "../../entities/game";
import { UserService } from "src/user/user.service";
import { EloService } from "../handle-game/elo.service";
import { GameService } from "../handle-game/game.service";

@Injectable()
export class RandomPairingService {
    private rapidPool: Player[] = [];
    private blitzPool: Player[] = [];
    private bulletPool: Player[] = [];

    constructor(
        private gameLinkService: GameLinkService,
        private userService: UserService,
        private eloService: EloService,
        private gameService: GameService,
        private chessService: ActiveGamesService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async addToPool(player: Player, mode: GameModeType) {
        const pool = this.getPoolByMode(mode);
        pool.push(player);
        return await this.tryToPairPlayers(mode);
    }

    async tryToPairPlayers(mode: GameModeType) {
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
            const newGame = await new Game(
                this.userRepository,
                this.userService,
                this.eloService,
                this.gameService,
            ).createGame(
                player1.playerId,
                player2.playerId,
                mode,
                "Random Pairing",
            );
            // encript game id
            const gameId = this.gameLinkService.genGameLinkEncodeByGameId(
                +newGame.gameId,
            );

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
    getPoolByMode(mode: GameModeType) {
        return this[`${mode}Pool`];
    }
}

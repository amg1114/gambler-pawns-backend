import { Game } from "./game";
import { Player } from "./entities/player";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game as GameEntity } from "./entities/game.entity";
import { GameMode } from "./entities/gameMode.entity";
import { User } from "../user/entities/user.entity";
import { GameLinkService } from "./gameLink/gameLink.service";

@Injectable()
export class GameChessManagerService {
    private rapidPool: Player[] = [];
    private blitzPool: Player[] = [];
    private bulletPool: Player[] = [];
    private activeGames: Map<string, Game> = new Map(); // Mapa de partidas activas

    // Almacenamos la relación entre jugadores y sockets
    private playerSocketMap: Map<string, string> = new Map(); // playerId -> socketId

    constructor(
        @InjectRepository(GameEntity)
        private gameEntityRepository: Repository<GameEntity>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(GameMode)
        private gameModeRepository: Repository<GameMode>,
        private gameLinkService: GameLinkService,
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
            const gameId = await this.gameLinkService.genGameLinkByGameId(
                +newGame.gameId,
            );
            newGame.gameId = gameId;
            // save game in memory (HashMap)
            this.activeGames.set(player1.playerId, newGame);
            this.activeGames.set(player2.playerId, newGame);
            return {
                gameId: gameId,
                player1Socket: player1.socketId,
                player2Socket: player2.socketId,
                playerWhite: newGame.whitesPlayer,
                playerBlack: newGame.blacksPlayer,
            };
        }
    }

    async handleMove(playerId: string, move: { from: string; to: string }) {
        const game = this.findGameByPlayerId(playerId);

        if (game) {
            return await game.makeMove(playerId, move);
        }
        // TODO: aquí iria una WsException ?
        return { error: "Juego no encontrado" };
    }

    handleResign(playerId: string) {
        const game = this.findGameByPlayerId(playerId);

        if (!game) {
            return { error: "Juego no encontrado" };
        }

        const winner =
            game.whitesPlayer.playerId === playerId ? "Black" : "White";
        game.endGame(winner); // Finaliza el juego actualizando el ELO y el estado
        return { game, winner };
    }

    registerPlayerSocket(playerId: string, socketId: string) {
        this.playerSocketMap.set(playerId, socketId);
    }

    getSocketIdByPlayerId(playerId: string): string | undefined {
        return this.playerSocketMap.get(playerId);
    }

    getPoolByMode(mode: "rapid" | "blitz" | "bullet") {
        return this[`${mode}Pool`];
    }

    findGameByPlayerId(playerId: string): Game | undefined {
        return this.activeGames.get(playerId);
    }
}

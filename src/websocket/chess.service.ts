import { Injectable } from "@nestjs/common";
import { Game } from "./game";

// hacer una consulta para enviar datos del opnente:
// elo, nickname, avatar, countryCode
interface Player {
    playerId: string;
    eloRating: number;
    socketId: string;
}

@Injectable()
export class GameChessManagerService {
    private rapidPool: Player[] = [];
    private blitzPool: Player[] = [];
    private bulletPool: Player[] = [];
    private activeGames: Map<string, Game> = new Map(); // Mapa de partidas activas

    // Almacenamos la relación entre jugadores y sockets
    private playerSocketMap: Map<string, string> = new Map(); // playerId -> socketId

    addToPool(player: Player, mode: "rapid" | "blitz" | "bullet") {
        const pool = this.getPoolByMode(mode);
        pool.push(player);
        return this.tryToPairPlayers(mode);
    }

    tryToPairPlayers(mode: "rapid" | "blitz" | "bullet") {
        const pool = this.getPoolByMode(mode);
        // TODO: agregar logica setTimeOut para esperar a que la pool tenga más jugadores +-5s

        if (pool.length < 2) return;

        // Ordenar jugadores por Elo
        pool.sort((a, b) => a.eloRating - b.eloRating);

        // Emparejar a los dos primeros jugadores
        const player1 = pool.shift();
        const player2 = pool.shift();

        if (player1 && player2) {
            const newGame = new Game(player1.playerId, player2.playerId);
            this.activeGames.set(player1.playerId, newGame);
            this.activeGames.set(player2.playerId, newGame);
            console.log(
                `Emparejando a ${player1.playerId} y ${player2.playerId}`,
            );
            return {
                player1Socket: player1.socketId,
                player2Socket: player2.socketId,
                gameId: player1.playerId,
            };
        }
    }

    getPoolByMode(mode: "rapid" | "blitz" | "bullet") {
        return this[`${mode}Pool`];
    }

    findGameByPlayerId(playerId: string): Game | undefined {
        return this.activeGames.get(playerId);
    }

    handleMove(playerId: string, move: { from: string; to: string }) {
        const game = this.findGameByPlayerId(playerId);

        if (game) {
            return game.makeMove(playerId, move);
        }
        // TODO: aquí iria una WsException ?
        return { error: "Juego no encontrado" };
    }

    registerPlayerSocket(playerId: string, socketId: string) {
        this.playerSocketMap.set(playerId, socketId);
    }

    getSocketIdByPlayerId(playerId: string): string | undefined {
        return this.playerSocketMap.get(playerId);
    }
}

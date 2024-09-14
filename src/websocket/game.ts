import { Chess } from "chess.js";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema";
import { Player } from "./entities/player";

// TODO: logica timers
// TODO: logica apuestas
// TODO: logica offer draw
// TODO: logica resign
// TODO: logica abandon
export class Game {
    public mode: "rapid" | "blitz" | "bullet";
    public gameId: string; //game id in db
    public player1: Player;
    public player2: Player;
    public board: Chess;
    private moveCount = 0;
    private db: NodePgDatabase<typeof schema>;

    constructor(
        db: NodePgDatabase<typeof schema>,
        player1: Player,
        player2Id: Player,
    ) {
        this.db = db;
        // aqui verifico si es guest, si no lo es, hago una consulta para obtener el elo
        this.player1.playerId = player1Id;
        this.player2.playerId = player2Id;
        this.board = new Chess();

        // Insert new game in DB
        this.createGameInDB();
        // TODO: cuando ambos jugadores son emparejados devolver un enlace con
        // el id de la partida para que puedan compartirlo y jugar
    }

    async createGameInDB() {
        const result = await this.db
            .insert(schema.game)
            .values({
                fk_whites_player: this.player1.playerId,
                fk_blacks_player: this.player2.playerId,
                elo_whites_before: this.player1.eloRating,
                elo_blacks_before: this.player2.eloRating,
                pgn: this.board.pgn(), // PGN inicial (vacío al inicio)
                fk_game_mode: 1, // Ejemplo: 1 para Blitz, 2 para Rapid, etc.
                game_time: new Date(),
            })
            .returning("game_id");

        this.gameId = result[0].game_id;
    }

    makeMove(playerId: string, move: { from: string; to: string }) {
        // Validar si es el turno del jugador correcto
        if (this.moveCount % 2 === 0 && playerId !== this.player1.playerId) {
            return { error: "No es tu turno" };
        }

        if (this.moveCount % 2 === 1 && playerId !== this.player2.playerId) {
            return { error: "No es tu turno" };
        }

        // Intentar hacer el movimiento
        const moveResult = this.board.move(move);
        if (!moveResult) {
            return { error: "Movimiento inválido" };
        }

        // Revisar si el juego ha terminado
        if (this.board.isGameOver()) {
            // TODO: terminar el juego en ese caso
            //await this.endGame();
            const winner = this.board.turn() === "w" ? "black" : "white";
            return { gameOver: true, winner };
        }

        //TODO: actualizar el estado del juego
        // Actualizar el PGN
        //this.pgn = this.board.pgn();

        // Actualizar la columna 'pgn' en la base de datos
        // await this.updatePGNInDB();

        // Aumentar el conteo de movimientos y devolver el resultado del movimiento
        this.moveCount++;
        return { moveResult, board: this.board.fen() };
    }

    getBoardState() {
        return this.board.fen();
    }

    /*
    async updatePGNInDB() {
    // Actualizar el campo 'pgn' con los movimientos actuales
    await db.update(game)
      .set({ pgn: this.pgn })
      .where(game.game_id.eq(this.gameId));
  }

      async endGame() {
    // Determinar el ganador
    let winner: 'white' | 'black' | null = null;
    if (this.board.isCheckmate()) {
      winner = this.board.turn() === 'w' ? 'black' : 'white';
    }

    // Actualizar el juego con el ganador y los elos finales
    await db.update(game)
      .set({
        winner: winner,
        elo_whites_after: this.player1.elo, // Actualiza con el nuevo elo
        elo_blacks_after: this.player2.elo, // Actualiza con el nuevo elo
      })
      .where(game.game_id.eq(this.gameId));
  }
    */
}

export class GamePlayer {
    public playerId: string;
    public eloRating;
    public time;
    public avatarImgPath;

    constructor(playerId: string) {
        this.playerId = playerId;
        this.eloRating = this.eloRating;
        //const time = new Date() TODO: algo así luego miro xd
        if (playerId.includes("guessPlayer")) {
        }
    }
}

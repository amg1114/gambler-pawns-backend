import { Chess } from "chess.js";

// TODO: logica timers
// TODO: logica apuestas
// TODO: logica offer draw
// TODO: logica resign
// TODO: logica abandon
export class Game {
    public player1Id: string;
    public player2Id: string;
    public board: Chess;
    private moveCount = 0;

    constructor(player1Id: string, player2Id: string) {
        this.player1Id = player1Id;
        this.player2Id = player2Id;
        this.board = new Chess();
    }

    makeMove(playerId: string, move: { from: string; to: string }) {
        // Validar si es el turno del jugador correcto
        if (this.moveCount % 2 === 0 && playerId !== this.player1Id) {
            return { error: "No es tu turno" };
        }
        if (this.moveCount % 2 === 1 && playerId !== this.player2Id) {
            return { error: "No es tu turno" };
        }

        // Intentar hacer el movimiento
        const moveResult = this.board.move(move);
        if (!moveResult) {
            return { error: "Movimiento inválido" };
        }

        // Revisar si el juego ha terminado
        if (this.board.isGameOver()) {
            const winner = this.board.turn() === "w" ? "black" : "white";
            return { gameOver: true, winner };
        }

        // Aumentar el conteo de movimientos y devolver el resultado del movimiento
        this.moveCount++;
        return { moveResult, board: this.board.fen() };
    }

    getBoardState() {
        return this.board.fen();
    }
}

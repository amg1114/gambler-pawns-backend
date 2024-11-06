import { WsException } from "@nestjs/websockets";
import { Chess } from "chess.js";

// entities
import { GameModeType, GameTypePairing } from "./db/game.entity";
import { PlayerCandidateVerifiedData } from "../submodules/players.service";

// TODO: logica apuestas
export class Game {
    public mode: GameModeType;
    public typePairing: GameTypePairing;
    public initialTime: number;
    public incrementTime: number;
    public gameId: string; // encrypted game id
    public whitesPlayer: PlayerCandidateVerifiedData;
    public blacksPlayer: PlayerCandidateVerifiedData;
    public board: Chess;

    constructor() {
        this.board = new Chess();
    }

    /** method init game */
    // TODO: pedir la instancia de ambos jugadores mas bien
    async createGame(
        whitesPlayer: PlayerCandidateVerifiedData,
        blacksPlayer: PlayerCandidateVerifiedData,
        mode: GameModeType,
        typePairing: GameTypePairing,
        initialTime: number,
        incrementTime: number,
    ) {
        this.mode = mode;
        this.typePairing = typePairing;
        this.initialTime = initialTime;
        this.incrementTime = incrementTime;
        this.whitesPlayer = whitesPlayer;
        this.blacksPlayer = blacksPlayer;
    }

    /** Validate and make move */
    makeMove(
        playerId: string,
        move: { from: string; to: string; promotion?: string },
    ) {
        if (
            (this.board.turn() === "w" &&
                playerId !== this.whitesPlayer.userInfo.userId.toString()) ||
            (this.board.turn() === "b" &&
                playerId !== this.blacksPlayer.userInfo.userId.toString())
        ) {
            throw new WsException("Not your turn");
        }

        try {
            const moveResult = this.board.move(move);
            return {
                moveResult,
                board: this.board.fen(),
                historyMoves: this.board.history(),
            };
        } catch (e) {
            throw new WsException("Invalid Move");
        }
    }
}

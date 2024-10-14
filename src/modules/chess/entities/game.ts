import { Repository } from "typeorm";
import { WsException } from "@nestjs/websockets";
import { Chess } from "chess.js";

// entities
import { GameModeType, GameTypePairing } from "./db/game.entity";
import { User } from "src/modules/user/entities/user.entity";
import { GamePlayer } from "./player";

// TODO: logica apuestas
export class Game {
    public mode: GameModeType;
    public typePairing: GameTypePairing;
    public initialTime: number;
    public incrementTime: number;
    public gameId: string; // encrypted game id
    public whitesPlayer: GamePlayer;
    public blacksPlayer: GamePlayer;
    public board: Chess;

    constructor() {
        this.board = new Chess();
    }

    /** method init game */
    async createGame(
        player1Id: string,
        player2Id: string,
        mode: GameModeType,
        typePairing: GameTypePairing,
        initialTime: number,
        incrementTime: number,
        userRepository: Repository<User>,
    ) {
        this.mode = mode;
        this.typePairing = typePairing;
        this.initialTime = initialTime;
        this.incrementTime = incrementTime;

        // Create players and assign sides
        this.whitesPlayer = await new GamePlayer(userRepository).create(
            player1Id,
            "w",
            this.mode,
        );
        this.blacksPlayer = await new GamePlayer(userRepository).create(
            player2Id,
            "b",
            this.mode,
        );
    }

    /** Validate and make move */
    makeMove(
        playerId: string,
        move: { from: string; to: string; promotion?: string },
    ) {
        if (
            (this.board.turn() === "w" &&
                playerId !== this.whitesPlayer.playerId) ||
            (this.board.turn() === "b" &&
                playerId !== this.blacksPlayer.playerId)
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

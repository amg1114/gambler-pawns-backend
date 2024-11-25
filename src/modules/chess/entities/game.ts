import { WsException } from "@nestjs/websockets";
import { BLACK, Chess, WHITE } from "chess.js";

// entities
import { GameModeType, GameTypePairing } from "./db/game.entity";
import { PlayerCandidateVerifiedData } from "../submodules/players.service";

export class Game {
    public mode: GameModeType;
    public typePairing: GameTypePairing;
    public timeInMinutes: number;
    public timeIncrementPerMoveSeconds: number;
    public gameId: string; // encrypted game id
    public whitesPlayer: PlayerCandidateVerifiedData;
    public blacksPlayer: PlayerCandidateVerifiedData;
    public board: Chess;

    constructor() {
        this.board = new Chess();
    }

    /** method to init game instance */
    createGame(
        whitesPlayer: PlayerCandidateVerifiedData,
        blacksPlayer: PlayerCandidateVerifiedData,
        mode: GameModeType,
        typePairing: GameTypePairing,
        timeInMinutes: number,
        timeIncrementPerMoveSeconds: number,
    ) {
        this.mode = mode;
        this.typePairing = typePairing;
        this.timeInMinutes = timeInMinutes;
        this.timeIncrementPerMoveSeconds = timeIncrementPerMoveSeconds;
        this.whitesPlayer = whitesPlayer;
        this.blacksPlayer = blacksPlayer;

        return this;
    }

    /** Validate and make move */
    makeMove(
        playerId: string,
        move: { from: string; to: string; promotion?: string },
    ) {
        if (
            (this.board.turn() === WHITE &&
                playerId !== this.whitesPlayer.userInfo.userId.toString()) ||
            (this.board.turn() === BLACK &&
                playerId !== this.blacksPlayer.userInfo.userId.toString())
        ) {
            throw new WsException("Not your turn");
        }

        try {
            const moveResult = this.board.move(move);
            return {
                moveResult,
                board: this.board.fen(),
                pgn: this.board.pgn(),
                historyMoves: this.board.history(),
            };
        } catch {
            throw new WsException("Invalid Move");
        }
    }

    getProperties() {
        return {
            gameId: this.gameId,
            mode: this.mode,
            timeInMinutes: this.timeInMinutes,
            timeIncrementPerMoveSeconds: this.timeIncrementPerMoveSeconds,
            typePairing: this.typePairing,
            playerWhite: this.tranformPlayerData(this.whitesPlayer),
            playerBlack: this.tranformPlayerData(this.blacksPlayer),
        };
    }

    private tranformPlayerData(player: PlayerCandidateVerifiedData) {
        return {
            isGuest: player.isGuest,
            elo: player.elo,
            userInfo: {
                userId: player.userInfo.userId,
                nickname: player.userInfo.nickname,
                aboutText: player.userInfo.aboutText,
                countryCode: player.userInfo.countryCode,
                userAvatarImg: player.userInfo.userAvatarImg,
            },
        };
    }
}

import { Chess } from "chess.js";
import { WsException } from "@nestjs/websockets";

// entities
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GameWinner, GameModeType, GameTypePairing } from "./db/game.entity";
import { User } from "src/modules/user/entities/user.entity";
import { GamePlayer } from "./player";

// services
import { UserService } from "src/modules/user/user.service";
import { EloService } from "../submodules/handle-game/elo.service";
import { GameService } from "../submodules/handle-game/game.service";
import { GameLinkService } from "../submodules/game-link/game-link.service";

// TODO: logica apuestas
export class Game {
    public mode: GameModeType;
    public typePairing: GameTypePairing;
    public initialTime: number;
    public incrementTime: number;
    public gameId: string; //game id in db
    public whitesPlayer: GamePlayer;
    public blacksPlayer: GamePlayer;
    public board: Chess;
    private moveCount = 0;
    private drawOffer: string | null = null; // id del jugador que ha hecho la oferta

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly userService: UserService,
        private readonly eloService: EloService,
        private readonly gameService: GameService,
        private readonly gameLinkService: GameLinkService,
    ) {}

    async createGame(
        player1Id: string,
        player2Id: string,
        mode: GameModeType,
        typePairing: GameTypePairing,
        initialTime: number,
        incrementTime: number,
    ) {
        this.mode = mode;
        this.typePairing = typePairing;
        this.board = new Chess();
        // dejar que la entidad GamePlayer se encargue de asignar los datos
        this.whitesPlayer = await new GamePlayer(this.userRepository).create(
            player1Id,
            "w",
            this.mode,
        );
        this.blacksPlayer = await new GamePlayer(this.userRepository).create(
            player2Id,
            "b",
            this.mode,
        );

        const gameInDB = await this.gameService.createGame(
            {
                gameTimestamp: new Date(),
                pgn: this.board.pgn(),
                whitesPlayer: this.whitesPlayer.user,
                blacksPlayer: this.blacksPlayer.user,
                eloWhitesBeforeGame: this.whitesPlayer.elo,
                eloBlacksBeforeGame: this.blacksPlayer.elo,
                gameMode: this.mode,
                typePairing: typePairing,
            },
            initialTime,
            incrementTime,
        );

        this.gameId = gameInDB.gameId;

        return this;
    }

    async makeMove(playerId: string, move: { from: string; to: string }) {
        // Check if is the turn of the current player
        if (
            this.moveCount % 2 === 0 &&
            playerId !== this.whitesPlayer.playerId
        ) {
            return { error: "Is not your turn" };
        }

        if (
            this.moveCount % 2 !== 0 &&
            playerId !== this.blacksPlayer.playerId
        ) {
            return { error: "Is not your turn" };
        }

        // try to make move
        try {
            const moveResult = this.board.move(move);

            // check if game is over
            if (this.board.isGameOver()) {
                const winner = this.board.turn() === "w" ? "b" : "w";
                await this.endGame(winner);
                return { gameOver: true, winner };
            }

            // TODO: implement game update with redis
            this.moveCount++;
            return { moveResult, board: this.board.fen() };
        } catch (e) {
            throw new WsException("Invalid Move");
        }
    }

    async endGame(winner: GameWinner) {
        // calculate new elo for both players
        const eloWhitesAfterGame = this.eloService.calculateNewElo(
            this.whitesPlayer.elo,
            this.blacksPlayer.elo,
            winner === "w" ? 1 : winner === "b" ? 0 : 0.5,
        );
        const eloBlacksAfterGame = this.eloService.calculateNewElo(
            this.blacksPlayer.elo,
            this.whitesPlayer.elo,
            winner === "b" ? 1 : winner === "w" ? 0 : 0.5,
        );

        // update streaks if players are not guests
        // TODO: how to handle guests?
        if (winner === "b") {
            await this.userService.increaseStreakBy1(
                this.blacksPlayer.playerId,
            );
            await this.userService.resetStreak(this.whitesPlayer.playerId);
        } else if (winner === "w") {
            await this.userService.increaseStreakBy1(
                this.whitesPlayer.playerId,
            );
            await this.userService.resetStreak(this.blacksPlayer.playerId);
        }

        await this.gameService.updateGameResult(this.gameId, {
            pgn: this.board.pgn(),
            winner: winner,
            eloWhitesAfterGame: eloWhitesAfterGame,
            eloBlacksAfterGame: eloBlacksAfterGame,
            // TODO: implement Game result type});
        });
    }

    // Manage draw offers
    // TODO: abstraerlas a un servicio
    offerDraw(playerId: string): string | null {
        if (this.drawOffer === null) {
            this.drawOffer = playerId;
            return playerId;
        }
        return null;
    }

    acceptDraw() {
        if (this.drawOffer !== null) {
            this.endGame("draw");
        }
    }

    rejectDraw() {
        if (this.drawOffer !== null) {
            this.drawOffer = null;
        }
    }

    // TODO: abstraerla a un servicio
    getOpponentId(playerId: string): string {
        return playerId === this.whitesPlayer.playerId
            ? this.blacksPlayer.playerId
            : this.whitesPlayer.playerId;
    }
}

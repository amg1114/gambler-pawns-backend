import { Chess } from "chess.js";
import { WsException } from "@nestjs/websockets";

// db entities
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game as GameEntity, GameWinner } from "./entities/game.entity";
import { GameMode } from "./entities/gameMode.entity";
import { User } from "../user/entities/user.entity";

// TODO: logica timers
// TODO: logica apuestas
export class Game {
    public mode: "rapid" | "blitz" | "bullet";
    public gameId: string; //game id in db
    public whitesPlayer: GamePlayer;
    public blacksPlayer: GamePlayer;
    public board: Chess;
    private moveCount = 0;
    private drawOffer: string | null = null; // id del jugador que ha hecho la oferta

    constructor(
        mode: "rapid" | "blitz" | "bullet",
        @InjectRepository(GameEntity)
        private readonly gameRepository: Repository<GameEntity>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(GameMode)
        private readonly gameModeRepository: Repository<GameMode>,
    ) {
        this.mode = mode;
        this.board = new Chess();
    }

    async createGameInDB(player1Id: string, player2Id: string) {
        this.whitesPlayer = new GamePlayer(player1Id, "Whites", 10000);
        this.blacksPlayer = new GamePlayer(player2Id, "Blacks", 10000);

        await this.verifyNonGuestPlayer(this.whitesPlayer);
        await this.verifyNonGuestPlayer(this.blacksPlayer);

        // TODO: refactorizar los modos de juego aceptados a lo largo
        // del lifecycle de la partida
        const gameMode = await this.gameModeRepository.findOneBy({
            mode: this.mode,
        });

        // NOTE: be careful with <player>.isGuest before insert
        const newGame = this.gameRepository.create({
            gameTimestamp: new Date(),
            pgn: this.board.pgn(),
            whitesPlayer: this.whitesPlayer.isGuest
                ? null
                : await this.userRepository.findOneBy({
                      userId: +this.whitesPlayer.playerId,
                  }),
            blacksPlayer: this.blacksPlayer.isGuest
                ? null
                : await this.userRepository.findOneBy({
                      userId: +this.blacksPlayer.playerId,
                  }),
            eloWhitesBeforeGame: +this.whitesPlayer.eloRating,
            eloBlacksBeforeGame: +this.blacksPlayer.eloRating,
            gameMode: gameMode,
            typePairing: "Random Pairing", // TODO: cambiar esto con la información adecuada
        });

        try {
            const savedGame = await this.gameRepository.save(newGame);
            this.gameId = savedGame.gameId.toString();
        } catch (e) {
            console.log("Error", e);
            throw new WsException("Error creando el juego en la base de datos");
        }
    }

    private async verifyNonGuestPlayer(player: GamePlayer) {
        if (player.isGuest) return;

        const user = await this.userRepository.findOneBy({
            userId: +player.playerId,
        });

        if (!user) {
            throw new WsException("El id del usuario no existe");
        }

        // TODO: revisar en general todas las consultas
        player.assignDataToNonGuestUser(
            user.nickname,
            user.aboutText,
            user.eloArcade, // TODO: cambiar esto dependiendo del modo
            user.userAvatarImg.fileName,
        );
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
            console.log(this.board);

            // check if game is over
            if (this.board.isGameOver()) {
                const winner = this.board.turn() === "w" ? "Black" : "White";
                await this.endGame(winner);
                return { gameOver: true, winner };
            }

            // NOTE: dont update pgn in db here, do it in endGame()
            this.moveCount++;
            // return current position
            return { moveResult, board: this.board.fen() };
        } catch (e) {
            console.log(this.board);
            throw new WsException("Invalid Move");
        }
    }

    async endGame(winner: GameWinner) {
        const eloWhitesAfterGame = this.calculateNewElo(
            this.whitesPlayer.eloRating,
            this.blacksPlayer.eloRating,
            winner === "White" ? 1 : winner === "Black" ? 0 : 0.5,
        );
        const eloBlacksAfterGame = this.calculateNewElo(
            this.blacksPlayer.eloRating,
            this.whitesPlayer.eloRating,
            winner === "Black" ? 1 : winner === "White" ? 0 : 0.5,
        );

        try {
            // update game in db
            await this.gameRepository.update(
                { gameId: +this.gameId },
                {
                    pgn: this.board.pgn(),
                    winner: winner,
                    eloWhitesAfterGame: eloWhitesAfterGame,
                    eloBlacksAfterGame: eloBlacksAfterGame,
                    // TODO: implement Game result type
                },
            );
        } catch (e) {
            console.log("Error actualizando el juego en la base de datos", e);
            throw new WsException("Error actualizando el juego");
        }
    }

    calculateNewElo(currentElo: number, opponentElo: number, score: number) {
        const kFactor = 32; // Ajuste de K, puede variar según el sistema de elo
        const expectedScore =
            1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
        return Math.round(currentElo + kFactor * (score - expectedScore));
    }

    // Manage draw offers
    offerDraw(playerId: string): string | null {
        if (this.drawOffer === null) {
            this.drawOffer = playerId;
            return playerId;
        }
        return null;
    }

    acceptDraw() {
        if (this.drawOffer !== null) {
            this.endGame("Draw");
        }
    }

    rejectDraw() {
        if (this.drawOffer !== null) {
            this.drawOffer = null;
        }
    }

    getOpponentId(playerId: string): string {
        return playerId === this.whitesPlayer.playerId
            ? this.blacksPlayer.playerId
            : this.whitesPlayer.playerId;
    }
}

export class GamePlayer {
    public playerId: string;
    public isGuest: boolean;
    public side: "Whites" | "Blacks";
    public time: number; // seconds
    // get this info if player is registered
    // info for
    // TODO: get this data in service in order to send it
    public nickname: string = null;
    public aboutText: string = null;
    public eloRating: number = null;
    public avatarImgPath: string | null = null;

    constructor(playerId: string, side: "Whites" | "Blacks", time: number) {
        this.playerId = playerId;
        this.isGuest = this.playerId.includes("GuestPlayer");
        this.side = side;
        this.time = time;
    }

    assignDataToNonGuestUser(
        nickname: string,
        aboutText: string,
        eloRating: number,
        avatarImgPath: string,
    ) {
        this.nickname = nickname;
        this.aboutText = aboutText;
        this.eloRating = eloRating;
        this.avatarImgPath = avatarImgPath;
    }
}

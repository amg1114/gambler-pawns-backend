import { Chess } from "chess.js";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema";
import { WsException } from "@nestjs/websockets";
import { eq } from "drizzle-orm";

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
    private db: NodePgDatabase<typeof schema>;

    constructor(
        mode: "rapid" | "blitz" | "bullet",
        db: NodePgDatabase<typeof schema>,
    ) {
        this.db = db;
        this.mode = mode;
        this.board = new Chess();
    }

    async createGameInDB(player1Id: string, player2Id: string) {
        this.whitesPlayer = new GamePlayer(player1Id, "Whites", 10000);
        this.blacksPlayer = new GamePlayer(player2Id, "Blacks", 10000);

        await this.verifyNonGuestPlayer(this.whitesPlayer);
        await this.verifyNonGuestPlayer(this.blacksPlayer);

        // NOTE: be careful with <player>.isGuest before insert
        const insertValues = {
            gameTimestamp: new Date(),
            pgn: this.board.pgn(),
            fkWhitesPlayerId: this.whitesPlayer.isGuest
                ? null
                : +this.whitesPlayer.playerId,
            fkBlacksPlayerId: this.blacksPlayer.isGuest
                ? null
                : +this.blacksPlayer.playerId,
            eloWhitesBeforeGame: +this.whitesPlayer.eloRating,
            eloBlacksBeforeGame: +this.blacksPlayer.eloRating,
            fkGameModeId: +this.getModeId(this.mode), // TODO: refactor getModeId func
            typePairing: "Random Pairing", // TODO: change this, include info in game:join socket message request
        } as typeof schema.game.$inferInsert;

        try {
            const result = await this.db
                .insert(schema.game)
                .values(insertValues)
                .returning({ insertedGameId: schema.game.gameId });
            this.gameId = result[0].insertedGameId.toString();
        } catch (e) {
            console.log("Error", e);
            throw new WsException("Error creating game in db");
        }
    }

    private async verifyNonGuestPlayer(player: GamePlayer) {
        // if is not a guest player verify if exits in db
        if (player.isGuest) return;

        const result = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.userId, +player.playerId));

        if (result.length < 0) {
            throw new WsException("El id del usuario no existe");
        }
        player.assignDataToNonGuestUser(
            result[0].nickname,
            result[0].about,
            result[0].eloArcade, // TODO: cambiar luego esto dependiendo del modo
            result[0].fkUserAvatarImgId.toString(),
        );
    }

    private getModeId(mode: "rapid" | "blitz" | "bullet"): number {
        // TODO: refactor this aghhhh
        // Retorna el ID correspondiente para el modo de juego (asume que tienes este mapeo)
        switch (mode) {
            case "rapid":
                return 1;
            case "blitz":
                return 3;
            case "bullet":
                return 5;
            default:
                throw new Error("Modo de juego no válido");
        }
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
                const winner = this.board.turn() === "w" ? "black" : "white";
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

    async endGame(winner: "white" | "black" | "draw") {
        const eloWhitesAfterGame = this.calculateNewElo(
            this.whitesPlayer.eloRating,
            this.blacksPlayer.eloRating,
            winner === "white" ? 1 : winner === "black" ? 0 : 0.5,
        );
        const eloBlacksAfterGame = this.calculateNewElo(
            this.blacksPlayer.eloRating,
            this.whitesPlayer.eloRating,
            winner === "black" ? 1 : winner === "white" ? 0 : 0.5,
        );

        //TODO: Maldito update no funciona, me cago en drizzle
        /*await this.db
            .update(schema.game)
            .set({
                pgn: this.board.pgn(),
                winner,
                eloWhitesAfterGame,
                eloBlacksAfterGame,
            })
            .where(eq(schema.game.gameId, +this.gameId));*/
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
            this.endGame("draw");
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

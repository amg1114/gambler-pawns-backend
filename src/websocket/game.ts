import { Chess } from "chess.js";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema";
import { WsException } from "@nestjs/websockets";
import { eq } from "drizzle-orm";

// TODO: logica timers
// TODO: logica apuestas
// TODO: logica offer draw
// TODO: logica resign
// TODO: logica abandon
export class Game {
    public mode: "rapid" | "blitz" | "bullet";
    public gameId: string; //game id in db
    public whitesPlayer: GamePlayer;
    public blacksPlayer: GamePlayer;
    public board: Chess;
    private moveCount = 0;
    private db: NodePgDatabase<typeof schema>;

    constructor(
        mode: "rapid" | "blitz" | "bullet",
        db: NodePgDatabase<typeof schema>,
    ) {
        this.db = db;
        this.mode = mode;
        this.board = new Chess();
        console.log(this.board);
    }

    async createGameInDB(player1Id: string, player2Id: string) {
        this.whitesPlayer = new GamePlayer(player1Id, "Whites", 10000);
        this.blacksPlayer = new GamePlayer(player2Id, "Blacks", 10000);

        await this.verifyNonGuestPlayer(this.whitesPlayer);
        await this.verifyNonGuestPlayer(this.blacksPlayer);

        // NOTE: becareful with <player>.isGuest before insert
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

            console.log("Game id", result[0]);
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
        console.log("Player", player);
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

    makeMove(playerId: string, move: { from: string; to: string }) {
        // Validar si es el turno del jugador correcto
        if (
            this.moveCount % 2 === 0 &&
            playerId !== this.whitesPlayer.playerId
        ) {
            return { error: "Is not your turn" };
        }

        if (
            this.moveCount % 2 === 1 &&
            playerId !== this.blacksPlayer.playerId
        ) {
            return { error: "Is not your turn" };
        }

        // Intentar hacer el movimiento
        const moveResult = this.board.move(move);
        if (!moveResult) {
            return { error: "Invalid move" };
        }

        // Revisar si el juego ha terminado
        if (this.board.isGameOver()) {
            // TODO: terminar el juego en ese caso
            //await this.endGame();
            const winner = this.board.turn() === "w" ? "black" : "white";
            return { gameOver: true, winner };
        }

        // NOTE: dont update pgn in db here, do it in endGame()
        this.moveCount++;
        // return current position
        return { moveResult, board: this.board.fen() };
    }

    async endGame() {
        // Actualizar el juego con el ganador y los elos finales
        // TODO: logica para actualizar el elo de los jugadores
        const updateData = {
            eloWhitesAfterGame: +this.whitesPlayer.eloRating,
            eloBlacksAfterGame: +this.blacksPlayer.eloRating,
            winner: "White" as const, // Asegúrate de que esto coincida con tu enum winnerEnum
        };

        await this.db
            .update(schema.game)
            .set(updateData)
            .where(eq(schema.game.gameId, +this.gameId));
    }
}

export class GamePlayer {
    public playerId: string;
    public isGuest: boolean;
    public side: "Whites" | "Blacks";
    public time: number; // seconds
    // get this info if player is registered
    // info for frontend
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

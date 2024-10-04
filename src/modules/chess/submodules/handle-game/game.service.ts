import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game as GameEntity } from "../../entities/db/game.entity";
import { TimerService } from "./timer.service";
import { GameLinkService } from "../game-link/game-link.service";

@Injectable()
/** Handle game operations in db */
export class GameService {
    constructor(
        @InjectRepository(GameEntity)
        private readonly gameRepository: Repository<GameEntity>,
        private readonly timerService: TimerService,
        private readonly gameLinkService: GameLinkService,
    ) {}

    async createGame(
        gameData: Partial<GameEntity>,
        initialTime: number,
        incrementTime: number,
    ) {
        const newGame = await this.gameRepository.save(
            this.gameRepository.create(gameData),
        );

        const gameEncriptedId = this.gameLinkService.genGameLinkEncodeByGameId(
            newGame.gameId,
        );

        // start timer for the game
        this.timerService.startTimer(
            gameEncriptedId,
            initialTime,
            incrementTime,
        );

        return {
            ...newGame,
            gameId: gameEncriptedId,
        };
    }
    // duda: debería hacer un metodo para iniciar una partida (crear una partida que justo esta iniciando) ?
    // para no manejar tanta logica de negocio en game.ts

    /*async playerMove(
        gameId: string,
        playerId: string,
        move: string,
        timeSpent: number,
    ): Promise<void> {
        // Lógica para validar el movimiento...

        // Actualizar el temporizador basado en el tiempo que tomó el jugador
        this.timerService.updateTimer(gameId, playerId, timeSpent);

        // Verificar si el tiempo de algún jugador ha llegado a cero (timeout)
        const { playerOneTime, playerTwoTime } =
            this.timerService.getTime(gameId);
        if (playerOneTime <= 0 || playerTwoTime <= 0) {
            // Manejar la lógica del timeout (por ejemplo, declarar al ganador o finalizar el juego)
            await this.endGame(gameId, "timeout");
        }
    }*/

    async updateGameResult(
        gameId: string,
        gameData: Partial<GameEntity>,
    ): Promise<void> {
        await this.gameRepository.update(
            this.gameLinkService.decodeGameLink(gameId),
            gameData,
        );
    }
}

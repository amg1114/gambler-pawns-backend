import { Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class TimerService {
    private timers: Map<
        string,
        {
            playerOneTime: number;
            playerTwoTime: number;
            increment: number;
            activePlayer: "playerOne" | "playerTwo";
        }
    > = new Map();

    startTimer(gameId: string, initialTime: number, increment: number): void {
        this.timers.set(gameId, {
            playerOneTime: initialTime,
            playerTwoTime: initialTime,
            increment: increment,
            activePlayer: "playerOne", // Player one starts
        });
    }

    updateTimer(gameId: string, playerId: string, timeSpent: number): void {
        const timer = this.timers.get(gameId);

        if (!timer) {
            throw new WsException(`No timer found for gameId: ${gameId}`);
        }

        if (timer.activePlayer === "playerOne") {
            timer.playerOneTime -= timeSpent;
            timer.playerOneTime += timer.increment;
            timer.activePlayer = "playerTwo"; // Change turn to player 2
        } else {
            timer.playerTwoTime -= timeSpent;
            timer.playerTwoTime += timer.increment;
            timer.activePlayer = "playerOne"; // Change turn to player 1
        }
        this.timers.set(gameId, timer);
    }

    getTime(gameId: string): { playerOneTime: number; playerTwoTime: number } {
        const timer = this.timers.get(gameId);

        if (!timer) {
            throw new Error(`No timer found for gameId: ${gameId}`);
        }

        return {
            playerOneTime: timer.playerOneTime,
            playerTwoTime: timer.playerTwoTime,
        };
    }

    /** Delete timer from map when game ends */
    stopTimer(gameId: string): void {
        this.timers.delete(gameId);
    }
}

/*
import { Injectable } from '@nestjs/common';
import { GameEntity } from './entities/game.entity'; // Asumiendo que GameEntity incluye un campo para el tiempo restante de cada jugador

@Injectable()
export class TimerService {
  private timers: Map<string, NodeJS.Timeout> = new Map(); // Map para almacenar los timers por ID de juego

  // Inicializa el reloj del juego con tiempo e incremento
  startTimer(game: GameEntity, initialTime: number, increment: number): void {
    game.playerOneTime = initialTime;
    game.playerTwoTime = initialTime;

    // Comenzamos el temporizador para cada jugador (esto depende de quién inicia primero)
    this.runTimer(game, 'playerOne');
  }

  // Método para manejar el tiempo
  runTimer(game: GameEntity, currentPlayer: 'playerOne' | 'playerTwo'): void {
    const timerId = setInterval(() => {
      if (currentPlayer === 'playerOne') {
        game.playerOneTime--;
      } else {
        game.playerTwoTime--;
      }

      // Si el tiempo se agota
      if (game.playerOneTime <= 0 || game.playerTwoTime <= 0) {
        this.endGameDueToTimeout(game);
        this.clearTimer(game.id);
      }

      // Aquí puedes emitir actualizaciones sobre el tiempo restante vía WebSockets
      // ej: this.gateway.emitTimeUpdate(game.id, game.playerOneTime, game.playerTwoTime);
    }, 1000);

    this.timers.set(game.id, timerId);
  }

  // Método para cambiar de turno y aplicar incremento
  changeTurn(game: GameEntity, lastPlayer: 'playerOne' | 'playerTwo', increment: number): void {
    // Pausa el temporizador actual
    this.clearTimer(game.id);

    // Aplica el incremento al jugador que acaba de mover
    if (lastPlayer === 'playerOne') {
      game.playerOneTime += increment;
    } else {
      game.playerTwoTime += increment;
    }

    // Cambia al otro jugador
    const nextPlayer = lastPlayer === 'playerOne' ? 'playerTwo' : 'playerOne';
    this.runTimer(game, nextPlayer);
  }

  // Método para finalizar el juego por tiempo agotado
  private endGameDueToTimeout(game: GameEntity): void {
    game.status = 'timeout';
    // Lógica adicional para manejar el final del juego
  }

  // Método para limpiar los temporizadores
  clearTimer(gameId: string): void {
    const timerId = this.timers.get(gameId);
    if (timerId) {
      clearInterval(timerId);
      this.timers.delete(gameId);
    }
  }

  // Método para detener el temporizador (cuando el juego termina, por ejemplo)
  stopTimer(gameId: string): void {
    this.clearTimer(gameId);
  }
}

*/

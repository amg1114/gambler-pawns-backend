import {
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from "@nestjs/common";
import { CreateGameLinkDto, GetGameByGameLinkDto } from "./dto/game.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { GameMode } from "../entities/gameMode.entity";
import { Repository } from "typeorm";
import Sqids from "sqids";
import { ConfigService } from "@nestjs/config";
import { Game } from "../entities/game.entity";

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(GameMode)
        private gameModeRepository: Repository<GameMode>,
        @InjectRepository(Game)
        private gameEntityRepository: Repository<Game>,
        private readonly configService: ConfigService,
    ) {}

    private sqids = new Sqids({
        minLength: 4,
        alphabet: this.configService.get<string>("ALPHABET"),
    });

    async createGameLink({ gameMode }: CreateGameLinkDto) {
        // Check if gameMode is in the database
        const isGameModeValid = await this.gameModeRepository.findOne({
            where: { mode: gameMode },
        });

        if (!isGameModeValid)
            throw new NotFoundException("Game mode not found");

        const newGame = this.gameEntityRepository.create({
            gameMode: isGameModeValid,
            pgn: "",
        });

        const savedGameEntity = await this.gameEntityRepository.save(newGame);

        return { encodedGameId: this.sqids.encode([savedGameEntity.gameId]) };
    }

    // This function is only resposible for generating a game link
    async genGameLinkByGameId(gameId: number) {
        return this.sqids.encode([gameId]);
    }

    async getGameByGameLink({ encodedId }: GetGameByGameLinkDto) {
        const decodedId = this.sqids.decode(encodedId);
        const reEncodedId = this.sqids.encode([decodedId[0]]);

        if (reEncodedId !== encodedId)
            throw new NotAcceptableException("Invalid ID");

        const game = await this.gameEntityRepository.findOne({
            where: { gameId: decodedId[0] },
        });

        if (!game) throw new NotFoundException("Game not found");
        return game;
    }
}

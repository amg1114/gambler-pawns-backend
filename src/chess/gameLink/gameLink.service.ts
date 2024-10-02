import {
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from "@nestjs/common";
import { CreateGameLinkDto } from "./dto/gameLink.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { GameMode } from "../entities/db/gameMode.entity";
import { Repository } from "typeorm";
import Sqids from "sqids";
import { ConfigService } from "@nestjs/config";
import { Game } from "../entities/db/game.entity";

@Injectable()
export class GameLinkService {
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

    async getGameId(encodedId: string) {
        //TODO: encodedId should be deconstructed from the (eventual) corresponding Dto
        //Not sure if this method will actually be used as is in the future
        const decodedId = this.sqids.decode(encodedId);
        const reEncodedId = this.sqids.encode([decodedId[0]]);

        if (reEncodedId !== encodedId)
            throw new NotAcceptableException("Invalid ID");

        const game = await this.gameEntityRepository.findOne({
            where: { gameId: decodedId[0] },
        });

        if (!game) throw new NotFoundException("Game not found");
        return { gameId: game.gameId };
    }
}

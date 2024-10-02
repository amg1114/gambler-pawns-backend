import { Module } from "@nestjs/common";
import { RandomPairingService } from "./random-pairing.service";
import { RandomPairingGateway } from "./random-pairing.gateway";
import { ChessService } from "../chess.service";

@Module({
    providers: [RandomPairingService, RandomPairingGateway, ChessService],
})
export class RandomPairingModule {}

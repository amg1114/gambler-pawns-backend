import { Module } from '@nestjs/common';
import { RandomPairingService } from './random-pairing.service';
import { RandomPairingGateway } from './random-pairing.gateway';

@Module({
  providers: [RandomPairingService, RandomPairingGateway]
})
export class RandomPairingModule {}

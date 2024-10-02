import { Test, TestingModule } from '@nestjs/testing';
import { RandomPairingService } from './random-pairing.service';

describe('RandomPairingService', () => {
  let service: RandomPairingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomPairingService],
    }).compile();

    service = module.get<RandomPairingService>(RandomPairingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

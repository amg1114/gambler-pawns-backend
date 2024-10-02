import { Test, TestingModule } from '@nestjs/testing';
import { RandomPairingGateway } from './random-pairing.gateway';

describe('RandomPairingGateway', () => {
  let gateway: RandomPairingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomPairingGateway],
    }).compile();

    gateway = module.get<RandomPairingGateway>(RandomPairingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

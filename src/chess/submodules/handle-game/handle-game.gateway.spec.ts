import { Test, TestingModule } from '@nestjs/testing';
import { HandleGameGateway } from './handle-game.gateway';

describe('HandleGameGateway', () => {
  let gateway: HandleGameGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleGameGateway],
    }).compile();

    gateway = module.get<HandleGameGateway>(HandleGameGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

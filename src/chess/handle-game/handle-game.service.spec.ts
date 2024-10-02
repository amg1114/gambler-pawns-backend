import { Test, TestingModule } from '@nestjs/testing';
import { HandleGameService } from './handle-game.service';

describe('HandleGameService', () => {
  let service: HandleGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleGameService],
    }).compile();

    service = module.get<HandleGameService>(HandleGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

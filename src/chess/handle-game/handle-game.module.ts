import { Module } from '@nestjs/common';
import { HandleGameService } from './handle-game.service';

@Module({
  providers: [HandleGameService]
})
export class HandleGameModule {}

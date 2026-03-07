import { Module } from '@nestjs/common';

import { AiModule } from '@core/ai';
import { DreamRepository } from '@core/repositories';

import { DreamController } from './dream.controller';
import { DreamService } from './dream.service';

@Module({
  imports: [AiModule],
  controllers: [DreamController],
  providers: [DreamService, DreamRepository],
  exports: [DreamService],
})
export class DreamModule {}

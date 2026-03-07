import { Module } from '@nestjs/common';

import { InsightRepository } from '@core/repositories';

import { InsightController } from './insight.controller';
import { InsightService } from './insight.service';

@Module({
  controllers: [InsightController],
  providers: [InsightService, InsightRepository],
  exports: [InsightService],
})
export class InsightModule {}

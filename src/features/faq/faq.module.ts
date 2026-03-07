import { Module } from '@nestjs/common';

import { FaqRepository } from '@core/repositories';

import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';

@Module({
  controllers: [FaqController],
  providers: [FaqService, FaqRepository],
  exports: [FaqService],
})
export class FaqModule {}

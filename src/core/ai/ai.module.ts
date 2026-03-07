import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerModule } from '@core/logger';

import { AiService } from './ai.service';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}

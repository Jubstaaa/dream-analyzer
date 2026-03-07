import { Global, Module } from '@nestjs/common';

import { UserRepository } from './user.repository';
import { DreamRepository } from './dream.repository';
import { InsightRepository } from './insight.repository';
import { FaqRepository } from './faq.repository';

@Global()
@Module({
  providers: [UserRepository, DreamRepository, InsightRepository, FaqRepository],
  exports: [UserRepository, DreamRepository, InsightRepository, FaqRepository],
})
export class RepositoryModule {}

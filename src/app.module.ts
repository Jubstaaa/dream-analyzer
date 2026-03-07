import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';

import {
  GlobalExceptionFilter,
  LoggerModule,
  CustomZodValidationPipe,
} from '@core';
import { RepositoryModule } from '@core/repositories';

import { AuthGuard } from './features/auth/guards/auth.guard';
import { DreamModule } from './features/dream';
import { FaqModule } from './features/faq';
import { InsightModule } from './features/insight';
import { SubscriptionModule } from './features/subscription';
import { UserModule } from './features/user';
import { ZodValidationExceptionFilter } from './shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    RepositoryModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    UserModule,
    DreamModule,
    InsightModule,
    FaqModule,
    SubscriptionModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ZodValidationExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}

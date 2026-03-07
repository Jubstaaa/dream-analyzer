import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

import { LoggerService } from '@core/logger';
import { FaqRepository } from '@core/repositories';
import {
  DEFAULT_LANGUAGE,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
} from '@shared';
import { PaginationOptions } from '@shared/utils';

@Injectable()
export class FaqService {
  constructor(
    private readonly faqRepository: FaqRepository,
    private readonly logger: LoggerService,
  ) {}

  private extractLanguage(i18n: I18nContext): SupportedLanguage {
    const lang = i18n.lang as SupportedLanguage;
    return SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
  }

  async getAllFaqs(pagination: Partial<PaginationOptions>, i18n: I18nContext) {
    const requestedLang = this.extractLanguage(i18n);
    this.logger.debug(`Requested language: ${requestedLang}`, 'FaqService');

    const result = await this.faqRepository.findActiveWithTranslations(
      requestedLang,
      {
        pageIndex: pagination.pageIndex ?? 0,
        pageSize: pagination.pageSize ?? 10,
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
      },
    );

    return {
      message: String(i18n.t('faq.fetched')),
      data: {
        ...result,
        requestedLanguage: requestedLang,
        returnedLanguage: requestedLang,
      },
    };
  }
}

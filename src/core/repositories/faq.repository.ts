import { Injectable } from '@nestjs/common';

import { supabaseAdmin } from '@config';
import {
  FaqBaseEntity,
  FaqEntity,
  FaqTranslationEntity,
} from '@shared/entities';
import { PaginatedResponse } from '@shared/schema/common.schema';
import { PaginationHelper, PaginationOptions } from '@shared/utils';

import { BaseRepository } from './base.repository';

@Injectable()
export class FaqRepository extends BaseRepository<FaqBaseEntity> {
  constructor() {
    super(supabaseAdmin, 'faqs');
  }

  async findActiveWithTranslations(
    language: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResponse<FaqEntity>> {
    const { pageIndex, pageSize, sortBy, sortOrder } =
      PaginationHelper.getDefaults(options, 'order');
    const { from, to } = PaginationHelper.calculateRange(pageIndex, pageSize);

    const { data, error, count } = await this.supabase
      .from(this.tableName)
      .select(
        `
        *,
        faq_translations!inner(*)
      `,
        { count: 'exact' },
      )
      .eq('isActive', true)
      .eq('faq_translations.language', language)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    return PaginationHelper.buildPaginatedResponse(
      (data ?? []).map((item) =>
        this.mapToEntityWithTranslation(item, language),
      ),
      count,
      pageIndex,
      pageSize,
    );
  }

  async findTranslation(
    faqId: string,
    language: string,
  ): Promise<FaqTranslationEntity | null> {
    const { data, error } = await this.supabase
      .from('faq_translations')
      .select('*')
      .eq('faqId', faqId)
      .eq('language', language)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as FaqTranslationEntity;
  }

  private mapToEntityWithTranslation(
    data: Record<string, unknown>,
    language: string,
  ): FaqEntity {
    const translations = data.faq_translations as
      | Record<string, unknown>[]
      | Record<string, unknown>;
    const translation = Array.isArray(translations)
      ? translations[0]
      : translations;

    return {
      id: data.id as string,
      order: data.order as number,
      isActive: data.isActive as boolean,
      question: (translation?.question as string) ?? '',
      answer: (translation?.answer as string) ?? '',
      language,
      createdAt: data.createdAt as string,
      updatedAt: data.updatedAt as string,
    };
  }
}

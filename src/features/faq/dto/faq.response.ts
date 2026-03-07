import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { LanguageSchema } from '@shared/schema/common.schema';

/**
 * FAQ item schema
 */
export const FaqItemSchema = z.object({
  id: z.string().uuid(),
  order: z.number(),
  question: z.string(),
  answer: z.string(),
  language: LanguageSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Paginated data schema
 */
export const FaqPaginatedDataSchema = z.object({
  pageIndex: z.number(),
  hasNextPage: z.boolean(),
  itemCount: z.number(),
  maxPageCount: z.number(),
  items: z.array(FaqItemSchema),
  requestedLanguage: LanguageSchema,
  returnedLanguage: LanguageSchema,
});

/**
 * FAQ list response schema
 */
export const FaqListResponseSchema = z.object({
  message: z.string(),
  data: FaqPaginatedDataSchema,
});

/**
 * DTOs
 */
export class FaqItemDto extends createZodDto(FaqItemSchema) {}
export class FaqListResponseDto extends createZodDto(FaqListResponseSchema) {}

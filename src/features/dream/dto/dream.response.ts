import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { DreamType } from '@shared/enums';

import { DreamTypeSchema } from './dream.request';

/**
 * Dream item schema
 */
export const DreamItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  interpretation: z.string().nullable(),
  date: z.string(),
  type: DreamTypeSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Paginated data schema
 */
export const DreamPaginatedDataSchema = z.object({
  pageIndex: z.number(),
  hasNextPage: z.boolean(),
  itemCount: z.number(),
  maxPageCount: z.number(),
  items: z.array(DreamItemSchema),
});

/**
 * Dream list response schema
 */
export const DreamListResponseSchema = z.object({
  message: z.string(),
  data: DreamPaginatedDataSchema,
});

/**
 * Dream success response schema
 */
export const DreamSuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: DreamItemSchema,
});

/**
 * DTOs
 */
export class DreamItemDto extends createZodDto(DreamItemSchema) {
  @ApiProperty({
    description:
      'Type of dream: 0=Normal, 1=Nightmare, 2=Lucid, 3=Recurring, 4=Prophetic, 5=Mixed',
    enum: [0, 1, 2, 3, 4, 5],
    example: 0,
  })
  type!: DreamType;
}

export class DreamListResponseDto extends createZodDto(
  DreamListResponseSchema,
) {}
export class DreamSuccessResponseDto extends createZodDto(
  DreamSuccessResponseSchema,
) {}

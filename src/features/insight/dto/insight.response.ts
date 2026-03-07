import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { InsightType } from "@shared/enums";

/**
 * Insight type schema (0-5)
 * 0: Psychological, 1: Spiritual, 2: Statistical, 3: Actionable, 4: Motivational, 5: Astrological
 */
export const InsightTypeSchema = z.nativeEnum(InsightType);

/**
 * Insight item schema
 */
export const InsightItemSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.string(),
  readingTime: z.number(),
  type: InsightTypeSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Paginated data schema
 */
export const InsightPaginatedDataSchema = z.object({
  pageIndex: z.number(),
  hasNextPage: z.boolean(),
  itemCount: z.number(),
  maxPageCount: z.number(),
  items: z.array(InsightItemSchema),
});

/**
 * Insight list response schema
 */
export const InsightListResponseSchema = z.object({
  message: z.string(),
  data: InsightPaginatedDataSchema,
});

/**
 * DTOs
 */
export class InsightItemDto extends createZodDto(InsightItemSchema) {
  @ApiProperty({
    description:
      "Type of insight: 0=Psychological, 1=Spiritual, 2=Statistical, 3=Actionable, 4=Motivational, 5=Astrological",
    enum: [0, 1, 2, 3, 4, 5],
    example: 0,
  })
  type!: InsightType;
}

export class InsightListResponseDto extends createZodDto(
  InsightListResponseSchema,
) {}

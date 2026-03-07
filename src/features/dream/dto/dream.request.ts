import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import {
  DREAM_CONTENT_MAX_LENGTH,
  DREAM_CONTENT_MIN_LENGTH,
} from '@shared/constants';
import { DreamType } from '@shared/enums';

/**
 * Dream type schema (0-5)
 * 0: Normal, 1: Nightmare, 2: Lucid, 3: Recurring, 4: Prophetic, 5: Mixed
 */
export const DreamTypeSchema = z.nativeEnum(DreamType);

/**
 * Create dream schema - Mobile sends 'description' which will be analyzed by AI
 */
export const CreateDreamSchema = z.object({
  description: z
    .string()
    .min(
      DREAM_CONTENT_MIN_LENGTH,
      `Description must be at least ${DREAM_CONTENT_MIN_LENGTH} characters`,
    )
    .max(
      DREAM_CONTENT_MAX_LENGTH,
      `Description must be at most ${DREAM_CONTENT_MAX_LENGTH} characters`,
    )
    .describe('Dream description to be analyzed by AI'),
  type: DreamTypeSchema.describe('Type of dream (0-5)'),
});

/**
 * DTOs
 */
export class CreateDreamDto extends createZodDto(CreateDreamSchema) {
  @ApiProperty({
    description:
      'Type of dream: 0=Normal, 1=Nightmare, 2=Lucid, 3=Recurring, 4=Prophetic, 5=Mixed',
    enum: [0, 1, 2, 3, 4, 5],
    example: 0,
  })
  type!: DreamType;

  @ApiProperty({
    description: 'Dream description to be analyzed by AI',
    minLength: DREAM_CONTENT_MIN_LENGTH,
    maxLength: DREAM_CONTENT_MAX_LENGTH,
    example: 'I was flying over a beautiful city at night...',
  })
  description!: string;
}

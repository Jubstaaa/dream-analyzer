import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  surname: z.string().min(1).max(100).optional(),
  imageUrl: z.string().url().optional(),
});

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}

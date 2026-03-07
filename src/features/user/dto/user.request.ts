import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const CreateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  surname: z.string().min(1).max(100),
  gender: z.string().optional(),
  birthday: z.string().optional(),
});

export class CreateProfileDto extends createZodDto(CreateProfileSchema) {}

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  surname: z.string().min(1).max(100).optional(),
  imageUrl: z.string().url().optional(),
  gender: z.string().optional(),
  birthday: z.string().optional(),
});

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}

import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  surname: z.string().nullable(),
  imageUrl: z.string().nullable(),
  premiumExpireDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UserProfileResponseSchema = z.object({
  message: z.string(),
  data: UserProfileSchema,
});

export class UserProfileDto extends createZodDto(UserProfileSchema) {}
export class UserProfileResponseDto extends createZodDto(
  UserProfileResponseSchema,
) {}

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { PaginatedResponse } from '../schema/common.schema';

export const ValidationErrorDetailSchema = z.object({
  field: z.string(),
  code: z.string(),
  message: z.string(),
});

export const ValidationErrorResponseSchema = z.object({
  statusCode: z.literal(400),
  message: z.string(),
  errors: z.array(ValidationErrorDetailSchema),
});

export const ErrorResponseSchema = z.object({
  message: z.string(),
  errorCode: z.string(),
});

export const SuccessResponseSchema = z.object({
  message: z.string(),
});

export class ValidationErrorDetailDto extends createZodDto(
  ValidationErrorDetailSchema,
) {}
export class ValidationErrorResponseDto extends createZodDto(
  ValidationErrorResponseSchema,
) {}
export class ErrorResponseDto extends createZodDto(ErrorResponseSchema) {}
export class SuccessResponseDto extends createZodDto(SuccessResponseSchema) {}

export type ValidationErrorDetail = z.infer<typeof ValidationErrorDetailSchema>;
export type ValidationErrorResponse = z.infer<
  typeof ValidationErrorResponseSchema
>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

export interface ApiSuccessResponse<T> {
  message: string;
  data: T;
}

export interface ApiPaginatedResponse<T> {
  message: string;
  data: PaginatedResponse<T>;
}

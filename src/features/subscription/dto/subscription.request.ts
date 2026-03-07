import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Verify Purchase schema
 */
export const VerifyPurchaseSchema = z.object({
  receiptData: z
    .string()
    .min(1, 'Receipt data is required')
    .describe('Purchase receipt from App Store or Google Play'),
  platform: z
    .enum(['ios', 'android'])
    .describe('Platform where purchase was made'),
});

/**
 * DTOs
 */
export class VerifyPurchaseDto extends createZodDto(VerifyPurchaseSchema) {}

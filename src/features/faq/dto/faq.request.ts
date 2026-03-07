import { createZodDto } from "nestjs-zod";

import { PaginationRequestSchema } from "@shared/schema/common.schema";

/**
 * Get FAQs query DTO
 */
export class GetFaqsQueryDto extends createZodDto(PaginationRequestSchema) {}

import { createZodDto } from "nestjs-zod";

import { PaginationRequestSchema } from "../schema/common.schema";

export class PaginationDto extends createZodDto(PaginationRequestSchema) {}

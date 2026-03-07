import { z } from "zod";

export const SUPPORTED_LANGUAGES = ["en", "tr"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

export const LanguageSchema = z.enum(SUPPORTED_LANGUAGES);

export const PaginationRequestSchema = z.object({
  pageIndex: z.coerce.number().int().min(0).optional().default(0),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type PaginationRequest = z.infer<typeof PaginationRequestSchema>;

export interface PaginatedResponse<T> {
  pageIndex: number;
  hasNextPage: boolean;
  itemCount: number;
  maxPageCount: number;
  items: T[];
}

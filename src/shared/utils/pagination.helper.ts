import { PaginatedResponse } from "@shared/schema/common.schema";

export interface PaginationOptions {
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationDefaults {
  pageIndex: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface PaginationRange {
  from: number;
  to: number;
}

export class PaginationHelper {
  static readonly DEFAULT_PAGE_INDEX = 0;
  static readonly DEFAULT_PAGE_SIZE = 10;
  static readonly DEFAULT_SORT_BY = "createdAt";
  static readonly DEFAULT_SORT_ORDER: "asc" | "desc" = "desc";

  static getDefaults(
    options?: PaginationOptions,
    defaultSortBy?: string,
  ): PaginationDefaults {
    return {
      pageIndex: options?.pageIndex ?? this.DEFAULT_PAGE_INDEX,
      pageSize: options?.pageSize ?? this.DEFAULT_PAGE_SIZE,
      sortBy: options?.sortBy ?? defaultSortBy ?? this.DEFAULT_SORT_BY,
      sortOrder: options?.sortOrder ?? this.DEFAULT_SORT_ORDER,
    };
  }

  static calculateRange(pageIndex: number, pageSize: number): PaginationRange {
    const from = pageIndex * pageSize;
    const to = from + pageSize - 1;
    return { from, to };
  }

  static buildPaginatedResponse<T>(
    items: T[],
    totalCount: number | null,
    pageIndex: number,
    pageSize: number,
  ): PaginatedResponse<T> {
    const itemCount = totalCount ?? 0;
    const maxPageCount = Math.ceil(itemCount / pageSize);
    const hasNextPage = pageIndex < maxPageCount - 1;

    return {
      pageIndex,
      hasNextPage,
      itemCount,
      maxPageCount,
      items,
    };
  }
}

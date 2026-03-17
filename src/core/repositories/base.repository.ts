import { SupabaseClient } from "@supabase/supabase-js";

import { NotFoundException } from "@core/exceptions";
import { PaginatedResponse } from "@shared/schema/common.schema";
import { PaginationHelper, PaginationOptions } from "@shared/utils";

export abstract class BaseRepository<T> {
  constructor(
    protected readonly supabase: SupabaseClient,
    protected readonly tableName: string,
  ) {}

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(
        (error as { message?: string }).message ?? JSON.stringify(error),
      );
    }

    return data as T;
  }

  async findByIdOrFail(id: string, resourceName: string): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new NotFoundException(resourceName, id);
    }
    return entity;
  }

  async findAll(options?: PaginationOptions): Promise<PaginatedResponse<T>> {
    return this.findWithFilters({}, options);
  }

  protected async findWithFilters<R = T>(
    filters: Record<string, unknown>,
    options?: PaginationOptions,
    defaultSortBy?: string,
    selectString = "*",
  ): Promise<PaginatedResponse<R>> {
    const {
      sortBy,
      sortOrder,
      pageIndex: rawPageIndex,
      pageSize: rawPageSize,
    } = PaginationHelper.getDefaults(options, defaultSortBy);
    const pageIndex = parseInt(String(rawPageIndex), 10);
    const pageSize = parseInt(String(rawPageSize), 10);

    const { from, to } = PaginationHelper.calculateRange(pageIndex, pageSize);

    let query = this.supabase
      .from(this.tableName)
      .select(selectString, { count: "exact" });

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error, count, status } = await query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to);

    if (status === 416) {
      let countQuery = this.supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true });
      Object.entries(filters)
        .filter(([key]) => !key.includes("."))
        .forEach(([key, value]) => {
          countQuery = countQuery.eq(key, value);
        });
      const { count: totalCount } = await countQuery;
      return PaginationHelper.buildPaginatedResponse(
        [],
        totalCount,
        pageIndex,
        pageSize,
      );
    }

    if (error) {
      throw new Error(
        (error as { message?: string }).message ?? JSON.stringify(error),
      );
    }

    return PaginationHelper.buildPaginatedResponse(
      data as R[],
      count,
      pageIndex,
      pageSize,
    );
  }

  async create(data: Partial<T>): Promise<T> {
    const { data: created, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error)
      throw new Error(
        (error as { message?: string }).message ?? JSON.stringify(error),
      );

    return created as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: updated, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error)
      throw new Error(
        (error as { message?: string }).message ?? JSON.stringify(error),
      );

    return updated as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq("id", id);

    if (error)
      throw new Error(
        (error as { message?: string }).message ?? JSON.stringify(error),
      );
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    let query = this.supabase
      .from(this.tableName)
      .select("*", { count: "exact", head: true });

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { count, error } = await query;

    if (error)
      throw new Error(
        (error as { message?: string }).message ?? JSON.stringify(error),
      );

    return count ?? 0;
  }
}

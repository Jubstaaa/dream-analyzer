import { Injectable } from "@nestjs/common";

import { supabaseAdmin } from "@config";
import { DreamEntity } from "@shared/entities";
import { PaginatedResponse } from "@shared/schema/common.schema";
import { DreamType } from "@shared/enums";
import { PaginationOptions } from "@shared/utils";

import { BaseRepository } from "./base.repository";

@Injectable()
export class DreamRepository extends BaseRepository<DreamEntity> {
  constructor() {
    super(supabaseAdmin, "dreams");
  }

  async findByUserId(
    userId: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResponse<DreamEntity>> {
    return this.findWithFilters({ userId }, options);
  }

  async findByType(
    userId: string,
    type: DreamType,
    options?: PaginationOptions,
  ): Promise<PaginatedResponse<DreamEntity>> {
    return this.findWithFilters({ userId, type }, options);
  }

  async countByUserId(userId: string): Promise<number> {
    return this.count({ userId });
  }

  async countByType(userId: string, type: DreamType): Promise<number> {
    return this.count({ userId, type });
  }
}

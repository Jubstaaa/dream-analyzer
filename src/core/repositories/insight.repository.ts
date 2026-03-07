import { Injectable } from '@nestjs/common';

import { supabaseAdmin } from '@config';
import { InsightEntity } from '@shared/entities';
import { PaginatedResponse } from '@shared/schema/common.schema';
import { InsightType } from '@shared/enums';
import { PaginationOptions } from '@shared/utils';

import { BaseRepository } from './base.repository';

@Injectable()
export class InsightRepository extends BaseRepository<InsightEntity> {
  constructor() {
    super(supabaseAdmin, 'insights');
  }

  async findActive(
    options?: PaginationOptions,
  ): Promise<PaginatedResponse<InsightEntity>> {
    return this.findWithFilters({ isActive: true }, options, 'date');
  }

  async findByType(
    type: InsightType,
    options?: PaginationOptions,
  ): Promise<PaginatedResponse<InsightEntity>> {
    return this.findWithFilters({ isActive: true, type }, options, 'date');
  }
}

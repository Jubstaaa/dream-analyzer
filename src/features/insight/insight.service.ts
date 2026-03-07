import { Injectable } from '@nestjs/common';

import { InsightRepository } from '@core/repositories';
import { PaginationRequest } from '@shared/schema/common.schema';
import { ApiResponseBuilder } from '@shared/utils';

@Injectable()
export class InsightService {
  constructor(private readonly insightRepository: InsightRepository) {}

  async getInsights(pagination: PaginationRequest) {
    const result = await this.insightRepository.findActive({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
    });

    return ApiResponseBuilder.paginated(
      result,
      'Insights fetched successfully',
    );
  }
}

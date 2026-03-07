import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { Public } from "@features/auth";
import { PaginationDto } from "@shared";

import { InsightService } from "./insight.service";
import { InsightListResponseDto } from "./dto/insight.response";

@Controller("insights")
@ApiTags("insight")
export class InsightController {
  constructor(private readonly insightService: InsightService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Get insights" })
  @ApiResponse({
    status: 200,
    description: "Success",
    type: InsightListResponseDto,
  })
  async getInsights(@Query() query: PaginationDto) {
    return this.insightService.getInsights(query);
  }
}

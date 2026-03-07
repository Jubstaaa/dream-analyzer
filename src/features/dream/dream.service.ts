import { Injectable } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";

import { AiService } from "@core/ai";
import { LoggerService } from "@core/logger";
import { DreamRepository } from "@core/repositories";
import { DreamEntity } from "@shared/entities";
import { PaginationRequest } from "@shared/schema/common.schema";
import { ApiResponseBuilder, EntityHelper } from "@shared/utils";

import { CreateDreamDto } from "./dto/dream.request";

@Injectable()
export class DreamService {
  constructor(
    private readonly dreamRepository: DreamRepository,
    private readonly aiService: AiService,
    private readonly logger: LoggerService,
  ) {}

  async getDreams(
    userId: string,
    pagination: PaginationRequest,
    i18n: I18nContext,
  ) {
    const result = await this.dreamRepository.findByUserId(userId, {
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
    });

    return ApiResponseBuilder.paginated(
      result,
      String(i18n.t("dream.fetched")),
    );
  }

  async getDreamById(userId: string, dreamId: string, i18n: I18nContext) {
    const dream = await this.dreamRepository.findById(dreamId);
    EntityHelper.verifyOwnership(dream, "Dream", dreamId, userId);

    return ApiResponseBuilder.success(dream, String(i18n.t("dream.fetched")));
  }

  async createDream(userId: string, dto: CreateDreamDto, i18n: I18nContext) {
    try {
      // Generate title and interpretation using OpenRouter AI
      const analysis = await this.aiService.analyzeDream(
        dto.description,
        dto.type,
      );

      const dreamData: Partial<DreamEntity> = {
        userId,
        title: analysis.title,
        content: dto.description,
        type: dto.type,
        date: new Date().toISOString(),
        interpretation: analysis.interpretation,
        aiModel: "meta-llama/llama-3.1-8b-instruct:free",
        aiTokensUsed: analysis.tokensUsed,
        interpretationGeneratedAt: new Date().toISOString(),
      };

      this.logger.log("Creating dream in database...", "DreamService");

      const dream = await this.dreamRepository.create(dreamData);

      this.logger.log(
        `Dream created with AI analysis: ${dream.id}, tokens: ${analysis.tokensUsed}`,
        "DreamService",
      );

      this.logger.log("Building API response...", "DreamService");

      const response = ApiResponseBuilder.success(
        dream,
        String(i18n.t("dream.created")),
      );

      this.logger.log("Response built successfully", "DreamService");

      return response;
    } catch (error) {
      // Fallback: If AI fails, create dream with simple title and no interpretation
      this.logger.error(
        "Dream creation failed",
        error instanceof Error ? error.message : JSON.stringify(error),
        "DreamService",
      );
      console.error("Full error object:", error);

      const title = this.generateTitleFromDescription(dto.description);

      const dreamData: Partial<DreamEntity> = {
        userId,
        title,
        content: dto.description,
        type: dto.type,
        date: new Date().toISOString(),
        interpretation: null,
        aiModel: null,
        aiTokensUsed: null,
        interpretationGeneratedAt: null,
      };

      const dream = await this.dreamRepository.create(dreamData);
      this.logger.log(`Dream created without AI: ${dream.id}`, "DreamService");

      return ApiResponseBuilder.success(dream, String(i18n.t("dream.created")));
    }
  }

  /**
   * Generate a simple title from description (first sentence or 50 chars)
   * Used as fallback when AI is unavailable
   */
  private generateTitleFromDescription(description: string): string {
    const firstSentence = description.split(/[.!?]/)[0].trim();
    if (firstSentence.length > 50) {
      return firstSentence.substring(0, 47) + "...";
    }
    return firstSentence || "Dream Entry";
  }
}

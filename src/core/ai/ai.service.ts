import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

import { LoggerService } from '@core/logger';
import { DreamType } from '@shared/enums';

const DREAM_TYPE_LABELS: Record<DreamType, string> = {
  [DreamType.NORMAL]: 'normal',
  [DreamType.NIGHTMARE]: 'nightmare',
  [DreamType.LUCID]: 'lucid',
  [DreamType.RECURRING]: 'recurring',
  [DreamType.PROPHETIC]: 'prophetic',
  [DreamType.MIXED]: 'mixed',
};

interface DreamAnalysisResult {
  title: string;
  interpretation: string;
  tokensUsed: number;
}

@Injectable()
export class AiService {
  private readonly openrouter: ReturnType<typeof createOpenRouter>;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');

    if (!apiKey) {
      this.logger.error(
        'OPENROUTER_API_KEY not found in environment',
        'Check your .env file',
        'AiService',
      );
      throw new Error(
        'OPENROUTER_API_KEY is required. Please set it in .env file.',
      );
    }

    this.model =
      this.configService.get<string>('OPENROUTER_MODEL') ||
      'meta-llama/llama-3.1-8b-instruct:free';

    this.logger.log(
      `AI Service initialized with model: ${this.model}`,
      'AiService',
    );

    this.openrouter = createOpenRouter({
      apiKey,
    });
  }

  async analyzeDream(
    description: string,
    dreamType: DreamType,
  ): Promise<DreamAnalysisResult> {
    try {
      const prompt = this.buildPrompt(description, dreamType);

      const result = await generateText({
        model: this.openrouter(this.model),
        messages: [
          {
            role: 'system',
            content:
              'You are a professional dream interpreter and psychologist. Provide insightful, helpful dream analysis.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const content = result.text;

      if (!content) {
        throw new Error('No content in OpenRouter response');
      }

      this.logger.log(
        `AI Response (first 200 chars): ${content.substring(0, 200)}`,
        'AiService',
      );

      const { title, interpretation } = this.parseResponse(content);
      const tokensUsed = result.usage?.totalTokens || 0;

      this.logger.log(
        `Dream analyzed successfully. Tokens: ${tokensUsed}, Title: "${title}"`,
        'AiService',
      );

      return {
        title,
        interpretation,
        tokensUsed,
      };
    } catch (error) {
      this.logger.error(
        'Dream analysis failed',
        error instanceof Error ? error.message : 'Unknown error',
        'AiService',
      );
      throw error;
    }
  }

  private buildPrompt(description: string, dreamType: DreamType): string {
    const typeLabel = DREAM_TYPE_LABELS[dreamType];
    return `Analyze this ${typeLabel} dream and provide:
1. A short, catchy title (max 50 characters)
2. A detailed interpretation (2-3 paragraphs)

Dream: ${description}

Format your response as:
TITLE: [your title here]
INTERPRETATION: [your interpretation here]`;
  }

  private parseResponse(content: string): {
    title: string;
    interpretation: string;
  } {
    const titleMatch = content.match(/TITLE:\s*(.+?)(?:\n|INTERPRETATION:)/i);
    const interpretationMatch = content.match(/INTERPRETATION:\s*(.+)/is);

    const title = titleMatch?.[1]?.trim() || 'Dream Entry';
    const interpretation =
      interpretationMatch?.[1]?.trim() ||
      'Unable to generate interpretation at this time.';

    return { title, interpretation };
  }
}

import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { I18n, I18nContext } from "nestjs-i18n";

import { Public } from "@features/auth";

import { FaqService } from "./faq.service";
import { GetFaqsQueryDto } from "./dto/faq.request";
import { FaqListResponseDto } from "./dto/faq.response";

@Controller("faqs")
@ApiTags("faq")
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Get FAQs" })
  @ApiResponse({
    status: 200,
    description: "Success",
    type: FaqListResponseDto,
  })
  async getAllFaqs(@Query() query: GetFaqsQueryDto, @I18n() i18n: I18nContext) {
    return this.faqService.getAllFaqs(query, i18n);
  }
}

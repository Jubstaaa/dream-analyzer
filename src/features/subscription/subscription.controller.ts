import { Body, Controller, Get, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import type { UserEntity } from "@shared/entities";
import { CurrentUser } from "@features/auth";

import { SubscriptionService } from "./subscription.service";
import { VerifyPurchaseDto } from "./dto/subscription.request";

@ApiBearerAuth()
@Controller("subscription")
@ApiTags("subscription")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get("status")
  @ApiOperation({ summary: "Get subscription status" })
  @ApiResponse({
    status: 200,
    description: "Success",
  })
  async checkSubscription(@CurrentUser() user: UserEntity) {
    return this.subscriptionService.checkSubscription(user.id);
  }

  @Post("verify-purchase")
  @ApiOperation({ summary: "Verify purchase" })
  @ApiResponse({
    status: 200,
    description: "Success",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid receipt",
  })
  async verifyPurchase(
    @CurrentUser() user: UserEntity,
    @Body() dto: VerifyPurchaseDto,
  ) {
    return this.subscriptionService.verifyPurchase(
      user.id,
      dto.receiptData,
      dto.platform,
    );
  }

  @Post("cancel")
  @ApiOperation({ summary: "Cancel subscription" })
  @ApiResponse({
    status: 200,
    description: "Success",
  })
  async cancelSubscription(@CurrentUser() user: UserEntity) {
    return this.subscriptionService.cancelSubscription(user.id);
  }
}

import { Injectable } from '@nestjs/common';

import { LoggerService } from '@core/logger';
import { UserRepository } from '@core/repositories';
import { ApiResponseBuilder } from '@shared/utils';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: LoggerService,
  ) {}

  async checkSubscription(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const premiumExpireDate = user.premiumExpireDate
      ? new Date(user.premiumExpireDate)
      : null;

    const isPremium = premiumExpireDate ? premiumExpireDate > now : false;

    return ApiResponseBuilder.success(
      {
        isPremium,
        premiumExpireDate: user.premiumExpireDate,
        daysRemaining: isPremium
          ? Math.ceil(
              (premiumExpireDate!.getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0,
      },
      'Subscription status retrieved successfully',
    );
  }

  async verifyPurchase(userId: string, _receiptData: string, platform: string) {
    // TODO: Implement actual purchase verification for iOS/Android
    // For now, this is a placeholder that simulates verification

    this.logger.log(
      `Verifying ${platform} purchase for user ${userId}`,
      'SubscriptionService',
    );

    // In production:
    // - For iOS: Verify with Apple's App Store Server API
    // - For Android: Verify with Google Play Billing API
    // - Decode the receipt and validate the purchase

    // Simulate successful verification - grant 30 days premium
    const premiumExpireDate = new Date();
    premiumExpireDate.setDate(premiumExpireDate.getDate() + 30);

    await this.userRepository.update(userId, {
      premiumExpireDate: premiumExpireDate.toISOString(),
    });

    this.logger.log(
      `Premium activated for user ${userId} until ${premiumExpireDate.toISOString()}`,
      'SubscriptionService',
    );

    return ApiResponseBuilder.success(
      {
        isPremium: true,
        premiumExpireDate: premiumExpireDate.toISOString(),
      },
      'Premium subscription activated successfully',
    );
  }

  async cancelSubscription(userId: string) {
    // In production, this would trigger cancellation on the platform side
    // For now, we just update the expiration to now
    await this.userRepository.update(userId, {
      premiumExpireDate: new Date().toISOString(),
    });

    this.logger.log(
      `Subscription cancelled for user ${userId}`,
      'SubscriptionService',
    );

    return ApiResponseBuilder.success(
      null,
      'Subscription cancelled successfully',
    );
  }
}

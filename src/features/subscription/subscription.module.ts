import { Module } from "@nestjs/common";

import { UserRepository } from "@core/repositories";

import { SubscriptionController } from "./subscription.controller";
import { SubscriptionService } from "./subscription.service";

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, UserRepository],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

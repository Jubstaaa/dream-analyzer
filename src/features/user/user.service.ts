import { Injectable } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";

import { UserRepository } from "@core/repositories";
import { UserEntity } from "@shared/entities";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createProfile(
    user: UserEntity,
    data: Partial<Pick<UserEntity, "name" | "surname" | "gender" | "birthday">>,
    i18n: I18nContext,
  ) {
    if (!user) {
      // Since the user entity might be returned as null if not found (or anon), check
      throw new Error("User not found");
    }

    const updated = await this.userRepository.update(user.id, data);

    return {
      message: String(i18n.t("user.profileUpdated")),
      data: updated,
    };
  }

  getProfile(user: UserEntity, i18n: I18nContext) {
    if (!user) {
      // Return a default anonymous profile if none exists
      return {
        message: String(i18n.t("user.profileFetched")),
        data: {
          id: "anon",
          email: "anon@dreamanalyzer.app",
          name: "Anonymous",
          surname: "User",
          imageUrl: null,
          gender: null,
          birthday: null,
          premiumExpireDate: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as UserEntity,
      };
    }

    return {
      message: String(i18n.t("user.profileFetched")),
      data: user,
    };
  }

  async updateProfile(
    user: UserEntity,
    data: Partial<
      Pick<UserEntity, "name" | "surname" | "imageUrl" | "gender" | "birthday">
    >,
    i18n: I18nContext,
  ) {
    if (!user) {
      throw new Error("Anonymous users cannot update profile");
    }

    const updated = await this.userRepository.update(user.id, data);

    return {
      message: String(i18n.t("user.profileUpdated")),
      data: updated,
    };
  }
}

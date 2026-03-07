import { Injectable } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";

import { UserRepository } from "@core/repositories";
import { UserEntity } from "@shared/entities";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createProfile(
    supabaseUser: any,
    data: Partial<Pick<UserEntity, "name" | "surname" | "gender" | "birthday">>,
    i18n: I18nContext,
  ) {
    if (!supabaseUser || !supabaseUser.id) {
      throw new Error("Supabase user not found");
    }

    // Since they don't have a profile yet, we insert it rather than update
    const newProfile = await this.userRepository.create({
      id: supabaseUser.id,
      email: supabaseUser.email,
      ...data,
      imageUrl: null,
      premiumExpireDate: null,
    });

    return {
      message: String(i18n.t("user.profileUpdated")),
      data: newProfile,
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

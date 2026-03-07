import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

import { UserRepository } from '@core/repositories';
import { UserEntity } from '@shared/entities';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(user: UserEntity, i18n: I18nContext) {
    return {
      message: String(i18n.t('user.profileFetched')),
      data: user,
    };
  }

  async updateProfile(
    user: UserEntity,
    data: Partial<Pick<UserEntity, 'name' | 'surname' | 'imageUrl'>>,
    i18n: I18nContext,
  ) {
    const updated = await this.userRepository.update(user.id, data);

    return {
      message: String(i18n.t('user.profileUpdated')),
      data: updated,
    };
  }
}

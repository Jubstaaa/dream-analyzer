import { Injectable } from '@nestjs/common';

import { supabaseAdmin } from '@config';
import { UserEntity } from '@shared/entities';

import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor() {
    super(supabaseAdmin, 'users');
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as UserEntity;
  }

  async hasPremium(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.premiumExpireDate) return false;

    return new Date(user.premiumExpireDate) > new Date();
  }

  async updatePremium(
    userId: string,
    expireDate: Date | null,
  ): Promise<UserEntity> {
    return this.update(userId, {
      premiumExpireDate: expireDate?.toISOString() ?? null,
    } as Partial<UserEntity>);
  }
}

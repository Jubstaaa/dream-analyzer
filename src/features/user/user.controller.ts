import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';

import { CurrentUser } from '@features/auth';
import type { UserEntity } from '@shared/entities';

import { UserService } from './user.service';
import { UpdateProfileDto, UserProfileResponseDto } from './dto';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile fetched successfully',
    type: UserProfileResponseDto,
  })
  async getProfile(
    @CurrentUser() user: UserEntity,
    @I18n() i18n: I18nContext,
  ) {
    return this.userService.getProfile(user, i18n);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserProfileResponseDto,
  })
  async updateProfile(
    @CurrentUser() user: UserEntity,
    @Body() dto: UpdateProfileDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.userService.updateProfile(user, dto, i18n);
  }
}

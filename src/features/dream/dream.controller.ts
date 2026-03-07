import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';

import type { UserEntity } from '@shared/entities';
import { PaginationDto, ValidationErrorResponseDto } from '@shared';
import { CurrentUser } from '@features/auth';

import { DreamService } from './dream.service';
import { CreateDreamDto } from './dto/dream.request';
import {
  DreamListResponseDto,
  DreamSuccessResponseDto,
} from './dto/dream.response';

@Controller('dreams')
@ApiTags('dream')
export class DreamController {
  constructor(private readonly dreamService: DreamService) {}

  @Get()
  @ApiOperation({ summary: 'Get dreams' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: DreamListResponseDto,
  })
  async getDreams(
    @CurrentUser() user: UserEntity,
    @Query() pagination: PaginationDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.dreamService.getDreams(user.id, pagination, i18n);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dream' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: DreamSuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not found',
  })
  async getDreamById(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ) {
    return this.dreamService.getDreamById(user.id, id, i18n);
  }

  @Post()
  @ApiOperation({ summary: 'Create dream' })
  @ApiResponse({
    status: 201,
    description: 'Success',
    type: DreamSuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  async createDream(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateDreamDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.dreamService.createDream(user.id, dto, i18n);
  }
}

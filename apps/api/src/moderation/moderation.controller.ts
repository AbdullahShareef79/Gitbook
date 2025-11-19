import { Controller, Post, Get, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IsString, IsEnum, MaxLength } from 'class-validator';

class CreateFlagDto {
  @IsString()
  @MaxLength(1000)
  reason: string;
}

class ResolveFlagDto {
  @IsEnum(['RESOLVED', 'DISMISSED'])
  status: 'RESOLVED' | 'DISMISSED';
}

@Controller('posts/:postId/flags')
export class PostFlagsController {
  constructor(private moderationService: ModerationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async flagPost(
    @Param('postId') postId: string,
    @Body() dto: CreateFlagDto,
    @Request() req
  ) {
    const flag = await this.moderationService.createFlag(
      req.user.userId,
      postId,
      dto.reason
    );

    return { success: true, flag };
  }
}

@Controller('flags')
export class FlagsController {
  constructor(private moderationService: ModerationService) {}

  // Admin-only: get all flags
  @Get()
  @UseGuards(JwtAuthGuard)
  async getFlags(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string
  ) {
    // TODO: Add admin check here
    const result = await this.moderationService.getFlags(
      cursor,
      limit ? parseInt(limit) : 20,
      status
    );

    return result;
  }

  // Admin-only: resolve flag
  @Post(':id/resolve')
  @UseGuards(JwtAuthGuard)
  async resolveFlag(
    @Param('id') id: string,
    @Body() dto: ResolveFlagDto,
    @Request() req
  ) {
    // TODO: Add admin check here
    const resolved = await this.moderationService.resolveFlag(
      id,
      req.user.userId,
      dto.status
    );

    return { success: resolved };
  }
}

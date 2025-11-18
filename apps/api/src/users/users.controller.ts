import { Controller, Get, Post, Delete, Param, UseGuards, Request, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('profile/:handle')
  async getProfile(@Param('handle') handle: string) {
    return this.users.getProfile(handle);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.users.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async follow(@Param('id') targetUserId: string, @Request() req) {
    return this.users.follow(req.user.userId, targetUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/follow')
  async unfollow(@Param('id') targetUserId: string, @Request() req) {
    return this.users.unfollow(req.user.userId, targetUserId);
  }

  @Get(':id/followers')
  async getFollowers(
    @Param('id') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ) {
    const parsedLimit = Math.min(parseInt(limit || '20', 10), 50);
    return this.users.getFollowers(userId, cursor, parsedLimit);
  }

  @Get(':id/following')
  async getFollowing(
    @Param('id') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ) {
    const parsedLimit = Math.min(parseInt(limit || '20', 10), 50);
    return this.users.getFollowing(userId, cursor, parsedLimit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/bookmarks')
  async getBookmarks(
    @Request() req,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ) {
    const parsedLimit = Math.min(parseInt(limit || '20', 10), 50);
    return this.users.getBookmarks(req.user.userId, cursor, parsedLimit);
  }
}


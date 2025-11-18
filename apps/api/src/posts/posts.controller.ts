import { Controller, Post, Get, Body, Query, UseGuards, Request, Param, Delete } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { IsString } from 'class-validator';
import { CreateInteractionDto, DeleteInteractionDto } from './dto/interaction.dto';

class CreateRepoCardDto {
  @IsString()
  projectId: string;
}

@Controller('posts')
export class PostsController {
  constructor(private posts: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('repo-card')
  async createRepoCard(@Body() dto: CreateRepoCardDto, @Request() req) {
    return this.posts.createRepoCard({
      projectId: dto.projectId,
      authorId: req.user.userId,
    });
  }

  @Get('feed')
  async getFeed(@Query('limit') limit?: string) {
    return this.posts.getFeed(undefined, limit ? parseInt(limit) : 20);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.posts.getPostById(id);
  }

  @Get(':id/interactions')
  async getInteractions(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.posts.getPostInteractions(id, userId);
  }

  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @Post(':id/like')
  async likePost(@Param('id') id: string, @Request() req) {
    return this.posts.addInteraction(id, req.user.userId, 'LIKE');
  }

  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @Post(':id/bookmark')
  async bookmarkPost(@Param('id') id: string, @Request() req) {
    return this.posts.addInteraction(id, req.user.userId, 'BOOKMARK');
  }

  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @Post(':id/comment')
  async commentPost(
    @Param('id') id: string,
    @Body() dto: { content: string },
    @Request() req,
  ) {
    if (!dto.content || dto.content.trim().length === 0) {
      throw new Error('Comment content is required');
    }
    return this.posts.addInteraction(id, req.user.userId, 'COMMENT', dto.content);
  }

  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @Delete(':id/interaction')
  async deleteInteraction(
    @Param('id') id: string,
    @Body() dto: DeleteInteractionDto,
    @Request() req,
  ) {
    return this.posts.deleteInteraction(id, req.user.userId, dto.kind);
  }
}
import { Controller, Get, Query, UseGuards, Request, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { MentionsService } from './mentions.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('mentions')
@UseGuards(JwtAuthGuard)
export class MentionsController {
  constructor(private mentionsService: MentionsService) {}

  @Get()
  async getUserMentions(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.mentionsService.getUserMentions(req.user.sub, page, limit);
  }

  @Get('search')
  async searchUsers(@Query('q') query: string, @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.mentionsService.searchUsersForMention(query, limit);
  }
}

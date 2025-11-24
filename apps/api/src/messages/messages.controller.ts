import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  async getConversations(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.messagesService.getConversations(req.user.sub, page, limit);
  }

  @Post('conversations/:userId')
  async createConversation(@Request() req, @Param('userId') otherUserId: string) {
    return this.messagesService.getOrCreateConversation(req.user.sub, otherUserId);
  }

  @Get('conversations/:conversationId')
  async getMessages(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.messagesService.getMessages(conversationId, req.user.sub, page, limit);
  }

  @Post('conversations/:conversationId')
  async sendMessage(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Body('content') content: string,
  ) {
    return this.messagesService.sendMessage(conversationId, req.user.sub, content);
  }

  @Delete(':messageId')
  async deleteMessage(@Request() req, @Param('messageId') messageId: string) {
    return this.messagesService.deleteMessage(messageId, req.user.sub);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    return this.messagesService.getUnreadCount(req.user.sub);
  }
}

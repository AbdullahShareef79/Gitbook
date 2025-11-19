import { Controller, Get, Post, Body, Query, UseGuards, Request, Sse, MessageEvent } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { Observable, interval } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

class MarkAsReadDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];

  @IsOptional()
  @IsBoolean()
  all?: boolean;
}

// In-memory SSE connections map
const sseConnections = new Map<string, (notification: any) => void>();

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  async getNotifications(
    @Request() req,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? Math.min(parseInt(limit), 50) : 20;
    return this.notifications.getNotifications(req.user.userId, cursor, limitNum);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.notifications.getUnreadCount(req.user.userId);
    return { count };
  }

  @Post('read')
  async markAsRead(@Body() dto: MarkAsReadDto, @Request() req) {
    if (dto.all) {
      await this.notifications.markAsRead(req.user.userId);
    } else if (dto.ids && dto.ids.length > 0) {
      await this.notifications.markAsRead(req.user.userId, dto.ids);
    }
    return { success: true };
  }

  // SSE stream for real-time notifications
  @Sse('stream')
  streamNotifications(@Request() req): Observable<MessageEvent> {
    const userId = req.user.userId;

    return interval(15000).pipe(
      switchMap(async () => {
        // Send heartbeat every 15 seconds
        const unreadCount = await this.notifications.getUnreadCount(userId);
        return { data: { type: 'heartbeat', unreadCount } };
      }),
      map((event) => event)
    );
  }
}

export { sseConnections };

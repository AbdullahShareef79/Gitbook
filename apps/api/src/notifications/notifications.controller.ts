import { Controller, Get, Post, Body, Query, UseGuards, Request, Sse, MessageEvent } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { Observable } from 'rxjs';

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

    // Register connection for push notifications
    const sendEvent = (notification: any) => {
      // This will be called when new notifications are created
    };
    sseConnections.set(userId, sendEvent);

    return new Observable((subscriber) => {
      // Send initial heartbeat
      this.notifications.getUnreadCount(userId).then(count => {
        subscriber.next({
          data: { type: 'heartbeat', unreadCount: count }
        } as any);
      });

      // Send heartbeat every 30 seconds
      const heartbeatInterval = setInterval(async () => {
        try {
          const unreadCount = await this.notifications.getUnreadCount(userId);
          subscriber.next({
            data: { type: 'heartbeat', unreadCount }
          } as any);
        } catch (error) {
          console.error('Heartbeat error:', error);
        }
      }, 30000);

      // Cleanup on disconnect
      return () => {
        clearInterval(heartbeatInterval);
        sseConnections.delete(userId);
      };
    });
  }
}

export { sseConnections };

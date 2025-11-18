import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { EventsService } from '../common/events.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [NotificationsModule],
  controllers: [UsersController],
  providers: [UsersService, EventsService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}

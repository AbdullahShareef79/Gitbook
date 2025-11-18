import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ProjectsModule } from '../projects/projects.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EventsService } from '../common/events.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ProjectsModule, NotificationsModule],
  controllers: [PostsController],
  providers: [PostsService, EventsService, PrismaService],
})
export class PostsModule {}

import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { EventsService } from '../common/events.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService, EventsService, PrismaService],
  exports: [FeedbackService],
})
export class FeedbackModule {}

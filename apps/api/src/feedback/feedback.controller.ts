import { Controller, Post, Get, Body, UseGuards, Request, Query } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { EventsService } from '../common/events.service';
import { IsString, MaxLength } from 'class-validator';

class CreateFeedbackDto {
  @IsString()
  @MaxLength(5000)
  text: string;
}

@Controller('feedback')
export class FeedbackController {
  constructor(
    private feedbackService: FeedbackService,
    private eventsService: EventsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createFeedback(@Body() dto: CreateFeedbackDto, @Request() req) {
    const feedback = await this.feedbackService.createFeedback(
      req.user.userId,
      dto.text,
      'feedback'
    );

    // Log analytics event
    this.eventsService.log(req.user.userId, 'feedback', {
      feedbackId: feedback.id,
    });

    return { success: true, feedback };
  }

  // Admin-only stub: get all feedback
  @Get()
  @UseGuards(JwtAuthGuard)
  async getFeedback(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    // TODO: Add admin check here
    const result = await this.feedbackService.getFeedback(
      cursor,
      limit ? parseInt(limit) : 20
    );

    return result;
  }

  // Public endpoint for waitlist submissions (no auth required)
  @Post('waitlist')
  async submitWaitlist(@Body() dto: CreateFeedbackDto) {
    const feedback = await this.feedbackService.createFeedback(
      null,
      dto.text,
      'waitlist'
    );

    return { success: true, message: 'Added to waitlist!' };
  }
}

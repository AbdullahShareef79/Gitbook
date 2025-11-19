import { Module } from '@nestjs/common';
import { PostFlagsController, FlagsController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PostFlagsController, FlagsController],
  providers: [ModerationService, PrismaService],
  exports: [ModerationService],
})
export class ModerationModule {}

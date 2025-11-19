import { Module } from '@nestjs/common';
import { PostFlagsController, FlagsController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGuard } from '../common/guards/admin.guard';

@Module({
  controllers: [PostFlagsController, FlagsController],
  providers: [ModerationService, PrismaService, AdminGuard],
  exports: [ModerationService],
})
export class ModerationModule {}

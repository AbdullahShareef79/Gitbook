import { Module } from '@nestjs/common';
import { JamTemplatesController } from './jam-templates.controller';
import { JamTemplatesService } from './jam-templates.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGuard } from '../common/guards/admin.guard';

@Module({
  controllers: [JamTemplatesController],
  providers: [JamTemplatesService, PrismaService, AdminGuard],
  exports: [JamTemplatesService],
})
export class JamTemplatesModule {}

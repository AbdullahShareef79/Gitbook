import { Module } from '@nestjs/common';
import { JamTemplatesController } from './jam-templates.controller';
import { JamTemplatesService } from './jam-templates.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [JamTemplatesController],
  providers: [JamTemplatesService, PrismaService],
  exports: [JamTemplatesService],
})
export class JamTemplatesModule {}

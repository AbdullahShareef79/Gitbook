import { Module } from '@nestjs/common';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGuard } from '../common/guards/admin.guard';

@Module({
  controllers: [InviteController],
  providers: [InviteService, PrismaService, AdminGuard],
  exports: [InviteService],
})
export class InviteModule {}

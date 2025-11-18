import { Controller, Get, Delete, UseGuards, Request } from '@nestjs/common';
import { GdprService } from './gdpr.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('gdpr')
export class GdprController {
  constructor(private gdpr: GdprService) {}

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async exportData(@Request() req) {
    return this.gdpr.exportUserData(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('erase')
  async eraseData(@Request() req) {
    return this.gdpr.eraseUserData(req.user.userId);
  }
}

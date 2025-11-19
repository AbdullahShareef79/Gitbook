import { Controller, Post, Get, Param, UseGuards, Request, Body } from '@nestjs/common';
import { JamsService } from './jams.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IsString, IsOptional } from 'class-validator';

class CreateJamDto {
  @IsString()
  @IsOptional()
  templateId?: string;
}

@Controller('jams')
export class JamsController {
  constructor(private jams: JamsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createJam(@Body() dto: CreateJamDto, @Request() req) {
    return this.jams.createJam(req.user.userId, dto.templateId);
  }

  @Get(':id')
  async getJam(@Param('id') id: string) {
    return this.jams.getJam(id);
  }

  @Get('room/:roomId')
  async getJamByRoomId(@Param('roomId') roomId: string) {
    return this.jams.getJamByRoomId(roomId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/snapshot')
  async saveSnapshot(
    @Param('id') id: string,
    @Body('update') update: string,
  ) {
    await this.jams.saveSnapshot(id, update);
    return { success: true };
  }

  @Get(':id/snapshot')
  async getSnapshot(@Param('id') id: string) {
    const snapshot = await this.jams.latestSnapshot(id);
    return { snapshot };
  }
}

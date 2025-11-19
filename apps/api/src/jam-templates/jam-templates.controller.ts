import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JamTemplatesService } from './jam-templates.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { IsString } from 'class-validator';

class CreateTemplateDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  language: string;

  @IsString()
  starterCode: string;
}

@Controller('jam-templates')
export class JamTemplatesController {
  constructor(private jamTemplatesService: JamTemplatesService) {}

  @Get()
  async getTemplates() {
    const templates = await this.jamTemplatesService.getTemplates();
    return { templates };
  }

  // Admin-only: create template
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createTemplate(@Body() dto: CreateTemplateDto) {
    const template = await this.jamTemplatesService.createTemplate(
      dto.title,
      dto.description,
      dto.language,
      dto.starterCode
    );

    return { template };
  }
}

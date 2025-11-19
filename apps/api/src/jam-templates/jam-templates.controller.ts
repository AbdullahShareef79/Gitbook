import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JamTemplatesService } from './jam-templates.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
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

  // Admin-only stub: create template
  @Post()
  @UseGuards(JwtAuthGuard)
  async createTemplate(@Body() dto: CreateTemplateDto) {
    // TODO: Add admin check here
    const template = await this.jamTemplatesService.createTemplate(
      dto.title,
      dto.description,
      dto.language,
      dto.starterCode
    );

    return { template };
  }
}

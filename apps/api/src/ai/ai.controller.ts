import { Controller, Post, Body, UseGuards, Sse } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AiService } from './ai.service';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

class JamAssistDto {
  action: 'explain' | 'test' | 'fix' | 'optimize' | 'document';
  code: string;
  language: string;
  context?: string;
}

@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('jam-assist')
  async jamAssist(@Body() dto: JamAssistDto) {
    const prompt = this.buildPrompt(dto);
    const response = await this.ai.complete(prompt);
    
    return {
      action: dto.action,
      suggestion: response,
      language: dto.language,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Sse('jam-assist-stream')
  streamJamAssist(@Body() dto: JamAssistDto): Observable<MessageEvent> {
    const prompt = this.buildPrompt(dto);
    
    return from(this.ai.completeStream(prompt)).pipe(
      map((chunk) => ({
        data: JSON.stringify({ chunk, action: dto.action }),
      } as MessageEvent)),
    );
  }

  private buildPrompt(dto: JamAssistDto): string {
    const prompts = {
      explain: `Explain this ${dto.language} code in simple terms. Be concise and focus on what it does and why:\n\n${dto.code}`,
      
      test: `Generate unit tests for this ${dto.language} code. Use appropriate testing framework (Jest/Vitest for JS/TS, pytest for Python):\n\n${dto.code}`,
      
      fix: `Analyze this ${dto.language} code for bugs, performance issues, or anti-patterns. Suggest fixes:\n\n${dto.code}${dto.context ? `\n\nContext: ${dto.context}` : ''}`,
      
      optimize: `Optimize this ${dto.language} code for better performance and readability. Explain improvements:\n\n${dto.code}`,
      
      document: `Generate JSDoc/docstring comments for this ${dto.language} code:\n\n${dto.code}`,
    };

    return prompts[dto.action] || prompts.explain;
  }
}

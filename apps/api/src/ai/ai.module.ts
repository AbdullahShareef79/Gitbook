import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { EmbeddingsService } from './embeddings.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiService, EmbeddingsService],
  exports: [AiService, EmbeddingsService],
})
export class AiModule {}

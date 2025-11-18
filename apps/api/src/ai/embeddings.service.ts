import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class EmbeddingsService {
  private apiKey: string;

  constructor(private config: ConfigService) {
    this.apiKey = config.get('OPENAI_API_KEY') || '';
  }

  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.apiKey) {
      console.warn('No OpenAI API key - skipping embedding generation');
      return null;
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          model: 'text-embedding-ada-002',
          input: text,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error.message);
      return null;
    }
  }

  async generateProjectEmbedding(project: {
    title: string;
    summary?: string;
    tags: string[];
  }): Promise<number[] | null> {
    const text = `${project.title} ${project.summary || ''} ${project.tags.join(' ')}`;
    return this.generateEmbedding(text);
  }
}

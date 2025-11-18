import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  private provider: string;
  private apiKey: string;

  constructor(private config: ConfigService) {
    this.provider = config.get('AI_PROVIDER') || 'openai';
    this.apiKey = config.get('OPENAI_API_KEY') || '';
  }

  async summarizeRepo(repoData: {
    name: string;
    description?: string;
    topics?: string[];
    readme?: string;
  }): Promise<string[]> {
    // If no API key, use mock summarizer
    if (!this.apiKey || this.provider === 'mock') {
      return this.mockSummarize(repoData);
    }

    try {
      const prompt = `Summarize this GitHub repository in 3-5 concise bullet points:
Name: ${repoData.name}
Description: ${repoData.description || 'N/A'}
Topics: ${repoData.topics?.join(', ') || 'N/A'}
README excerpt: ${repoData.readme?.slice(0, 500) || 'N/A'}

Format: Return only bullet points, one per line.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 200,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data.choices[0].message.content;
      return content
        .split('\n')
        .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map((line) => line.replace(/^[-•]\s*/, '').trim())
        .filter((line) => line.length > 0)
        .slice(0, 5);
    } catch (error) {
      console.error('AI summarization error:', error.message);
      return this.mockSummarize(repoData);
    }
  }

  async generateCodeSuggestion(code: string, instruction: string): Promise<string> {
    if (!this.apiKey || this.provider === 'mock') {
      return `// Mock suggestion for: ${instruction}\n${code}`;
    }

    try {
      const prompt = `Given this code:\n\n${code}\n\nTask: ${instruction}\n\nProvide the improved code:`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI code generation error:', error.message);
      return `// Error generating suggestion\n${code}`;
    }
  }

  private mockSummarize(repoData: any): string[] {
    const bullets = [
      `Repository: ${repoData.name}`,
      repoData.description || 'No description provided',
    ];
    if (repoData.topics && repoData.topics.length > 0) {
      bullets.push(`Technologies: ${repoData.topics.slice(0, 3).join(', ')}`);
    }
    bullets.push('Mock AI summary - configure OPENAI_API_KEY for real summaries');
    return bullets;
  }

  // Generic completion for Jam AI assist
  async complete(prompt: string): Promise<string> {
    if (!this.apiKey || this.provider === 'mock') {
      return `[Mock AI Response]\n\nThis is a simulated response. Configure OPENAI_API_KEY for real AI assistance.\n\nPrompt was: ${prompt.substring(0, 100)}...`;
    }

    try {
      const model = this.config.get('SUMMARY_MODEL') || 'gpt-4o-mini';
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI completion error:', error.message);
      return 'Error: Unable to generate AI response. Please check your API configuration.';
    }
  }

  // Streaming completion (placeholder - would need OpenAI SDK for real streaming)
  async *completeStream(prompt: string): AsyncGenerator<string> {
    // For now, simulate streaming by chunking the response
    const response = await this.complete(prompt);
    const words = response.split(' ');
    
    for (const word of words) {
      yield word + ' ';
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

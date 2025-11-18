import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private search: SearchService) {}

  @Get('projects')
  async searchProjects(@Query('q') query: string) {
    return this.search.searchProjects(query);
  }
}

import { Module } from '@nestjs/common';
import { JamsController } from './jams.controller';
import { JamsService } from './jams.service';

@Module({
  controllers: [JamsController],
  providers: [JamsService],
})
export class JamsModule {}

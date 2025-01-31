import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';

@Module({
  providers: [AgentsService],
  controllers: [AgentsController]
})
export class AgentsModule {}

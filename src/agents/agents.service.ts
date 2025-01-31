import { Injectable, NotFoundException } from '@nestjs/common';
import knexDB from 'src/db/knex.db';

@Injectable()
export class AgentsService {
  async findAvailableAgent() {
    try {
      const agent = knexDB('agent').where({ active: true }).first();

      if (!agent) {
        throw new NotFoundException('No available agent found');
      }
      return agent;
    } catch (error) {
      console.log('findAvailableAgent error ', error);
      return null;
    }
  }
}

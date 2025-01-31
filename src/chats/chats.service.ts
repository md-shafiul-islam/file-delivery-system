import { Injectable, NotFoundException } from '@nestjs/common';
import { AgentsService } from 'src/agents/agents.service';
import knexDB from 'src/db/knex.db';

@Injectable()
export class ChatsService {
  constructor(private readonly agentServices: AgentsService) {}

  async saveMessage(
    chatId: string,
    senderId: string,
    content: string,
    file: {
      fileUrl: string;
      fileName: string;
      fileType: string;
      fileKey: string;
    },
  ) {
    return knexDB('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content,
        file_url: file.fileUrl || null,
        file_name: file.fileName || null,
        file_type: file.fileType || null,
        file_key: file.fileKey || null,
      })
      .returning('*');
  }

  async getMessagesByChatId(chatId: string) {
    return knexDB('messages')
      .where({ chat_id: chatId })
      .orderBy('created_at', 'asc');
  }

  async findActiveChat(customerId: string) {
    return knexDB('chats')
      .where({ customer_id: customerId, active: true })
      .first();
  }

  async createChat(customerId: string) {
    const chat = knexDB('chats')
      .insert({
        customer_id: customerId,
        active: true,
      })
      .returning('*');
    console.log('Create Chart, ', chat);
    return chat;
  }

  async assignAgentToChat(chatId: string) {
    try {
      const agent = await this.agentServices.findAvailableAgent();

      if (!agent) {
        throw new NotFoundException('No agents available');
      }

      const items = await knexDB('chats')
        .where({ id: chatId })
        .update({ agentId: agent.id }, ['customer_id', 'agent_id']);

      if (!Array.isArray(items)) {
        throw new Error('Chat Agent assignment failed');
      }

      if (items.length === 0) {
        throw new Error('Chat Agent assignment failed');
      }

      return { agentId: agent.id, chatId };
    } catch (error) {
      console.log('assignAgentToChat Error, ', error);
      return { chatId };
    }
  }
}

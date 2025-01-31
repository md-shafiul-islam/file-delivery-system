import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatService: ChatsService) {}

  @Get(':chatId/messages')
  async getMessages(@Param('chatId') chatId: string) {
    return this.chatService.getMessagesByChatId(chatId);
  }

  @Post('start-chat')
  async startChat(@Body() { customerId }: { customerId: string }) {
    const existingChat = await this.chatService.findActiveChat(customerId);

    if (existingChat) {
      return { chatId: existingChat.id }; // Return existing chat
    }

    const newChat = await this.chatService.createChat(customerId);
    return { chatId: newChat[0]?.id }; // Return new chat ID
  }
}

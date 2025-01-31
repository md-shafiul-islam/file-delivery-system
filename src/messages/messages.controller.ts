import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
    
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async writeMessage(@Body() body: { message: string; user: string }) {}

  @Get()
  async readMessage(@Query('user') user: string) {}

  @Get()
  async getOneMessage(@Query('id') id: string) {}

  @Patch()
  async markAsRead(@Body() body: { id: string }) {}

  @Patch()
  async updateMessage(@Body() body: { id: string; message: string }) {}
}

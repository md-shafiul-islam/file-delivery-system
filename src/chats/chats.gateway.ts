import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';

@WebSocketGateway({ cors: true })
export class ChatsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatServices: ChatsService) {}

  // Handle user joining a room (customer or agent)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() { chatId }: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(chatId);
    console.log(`User ${client.id} joined room ${chatId}`);
  }

  // Handle sending a message in a specific room
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() { chatId, senderId, content, file }: any,
  ) {
    const message = await this.chatServices.saveMessage(
      chatId,
      senderId,
      content,
      file,
    );

    this.server.to(chatId).emit('receiveMessage', message);
  }
}

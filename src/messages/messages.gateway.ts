import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MessagesGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() data: any) {
    this.server.emit('receiveMessage', data); // Broadcast to all clients
  }

  @SubscribeMessage('uploadProgress')
  handleUploadProgress(@MessageBody() { progress, fileId }) {
    this.server.emit(`uploadProgress:${fileId}`, { progress });
  }
}

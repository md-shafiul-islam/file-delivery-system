import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class FileUploadGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('upload-progress')
  handleUploadProgress(@MessageBody() data: { progress: number }) {
    this.server.emit('progress-update', data);
  }
}

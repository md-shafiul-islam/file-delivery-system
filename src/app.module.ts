import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileModule } from './file/file.module';
import { FileUploadGateway } from './file-upload/file-upload.gateway';
import { MessagesModule } from './messages/messages.module';
import { ChatsModule } from './chats/chats.module';
import { AgentsModule } from './agents/agents.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [FileModule, MessagesModule, ChatsModule, AgentsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, FileUploadGateway],
})
export class AppModule {}

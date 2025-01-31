import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileModule } from './file/file.module';
import { FileUploadGateway } from './file-upload/file-upload.gateway';
import { ChatsModule } from './chats/chats.module';
import { AgentsModule } from './agents/agents.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './roles/roles.guard';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [FileModule, ChatsModule, AgentsModule, UsersModule, AuthModule, PaymentsModule],
  controllers: [AppController],
  providers: [
    AppService,
    FileUploadGateway,
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

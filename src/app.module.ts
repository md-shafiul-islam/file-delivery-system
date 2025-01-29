import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileModule } from './file/file.module';
import { FileUploadGateway } from './file-upload/file-upload.gateway';

@Module({
  imports: [FileModule],
  controllers: [AppController],
  providers: [AppService, FileUploadGateway],
})
export class AppModule {}

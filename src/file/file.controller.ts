import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { Express } from 'express';
import { Multer } from 'multer';

@Controller('file')
export class FileController {
  constructor(private readonly fileServices: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const uploadResponse = await this.fileServices.uploadFile(file);
    return { fileUrl: uploadResponse.Location };
  }

  @Get('signed-url')
  async getSignedUrl(@Query('fileKey') fileKey: string) {
    const url = await this.fileServices.generateSignedUrl(fileKey);
  }
}

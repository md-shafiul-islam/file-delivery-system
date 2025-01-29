import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { Express } from 'express';

@Controller('file')
export class FileController {
  constructor(private readonly fileServices: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res) {
    const uploadResponse = await this.fileServices.uploadFile(file);
    return res.json({ fileUrl: uploadResponse.Location });
  }

  @Get('signed-url')
  async getSignedUrl(@Query('fileKey') fileKey: string) {
    return this.fileServices.generateSignedUrl(fileKey);
  }
}

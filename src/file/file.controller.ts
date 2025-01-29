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
    return res.json({ fileUrl: uploadResponse });
  }

  @Get('download-url')
  async getSignedUrl(@Query('fileKey') fileKey: string) {
    return this.fileServices.generateDownloadUrl(fileKey);
  }

  @Get('upload-url')
  async getUploadUrl(
    @Query('fileKey') fileKey: string,
    @Query('contentType') contentType: string,
    @Res() res,
  ) {
    try {
      const uploadUrl = await this.fileServices.generateUploadUrl(
        fileKey,
        contentType,
      );
      return res.status(200).json({ uploadUrl });
    } catch (error) {
      console.error('Generate upload URL error:', error);
      return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  }
}

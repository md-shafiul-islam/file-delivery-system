import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { Express, Response } from 'express';
import * as crypto from 'crypto';
import { createReadStream } from 'fs';
import * as path from 'path';

@Controller('file')
export class FileController {
  constructor(private readonly fileServices: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res) {
    const uploadResponse = await this.fileServices.uploadFile(file);
    return res.json({ fileUrl: uploadResponse });
  }

  //File Store in local store
  @Get('stream')
  streamFile(@Query('fileKey') fileKey: string, @Res() res: Response) {
    const filePath = path.join(__dirname, '../../uploads/', fileKey);

    const fileStream = createReadStream(filePath); // Stream instead of loading

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileKey}"`);

    fileStream.pipe(res);
  }

  @Post('download-url')
  async getSignedUrl(@Body() body: { fileKey: string }, @Res() res) {
    try {
      const downloadUrl = await this.fileServices.generateDownloadUrl(
        body.fileKey,
      );
      return res.status(200).json({ downloadUrl });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to generate download URL' });
    }
  }

  @Get('rang-download')
  async downloadFile(
    @Query('fileKey') fileKey: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const file = await this.fileServices.getFileByKey(fileKey);
      if (!file) throw new NotFoundException('File not found');

      const range = req.headers['range']; // Check for Range header
      const url = await this.fileServices.generateRangDownloadUrl(
        fileKey,
        range,
      );

      // Generate ETag (based on file versioning)
      const etag = crypto
        .createHash('md5')
        .update(file.version.toString())
        .digest('hex');

      // Check if file is cached
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end(); // Not Modified
      }

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${file.original_name}"`,
      );
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.setHeader('ETag', etag);

      return res.redirect(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ error: 'Failed to download file' });
    }
  }

  @Post('upload-url')
  async getUploadUrl(
    @Body() body: { fileKey: string; contentType: string },
    @Res() res,
  ) {
    try {
      const uploadUrl = await this.fileServices.generateUploadUrl(
        body.fileKey,
        body.contentType,
      );
      return res.status(200).json({ uploadUrl });
    } catch (error) {
      console.error('Generate upload URL error:', error);
      return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  }

  @Post('save-metadata')
  async saveMetadata(
    @Body()
    body: {
      fileKey: string;
      contentType: string;
      fileUrl: string;
      originalname: string;
    },
    @Res() res,
  ) {
    try {
      const fileSave = await this.fileServices.saveMetadata(body);
      if (!fileSave) {
        throw new Error('File Metadat Save failed');
      }
      return res.status(200).json({
        response: null,
        message: 'File save successfully',
        staus: true,
      });
    } catch (error) {
      console.error('CN saveMetadata error:', error);
      return res.status(500).json({ error: 'Failed to Save File metadata' });
    }
  }
}

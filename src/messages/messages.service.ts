import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import sharp from 'sharp';
import knex from 'src/db/knex.db';

@Injectable()
export class MessagesService {
  private knex: Knex;
  constructor() {
    this.knex = knex;
  }

  async saveMessage(senderId: string, content: string, fileId?: string) {
    return this.knex('messages').insert({
      sender_id: senderId,
      content,
      file_id: fileId || null,
    });
  }

  async saveFile(
    fileName: string,
    fileUrl: string,
    fileType: string,
    fileSize: number,
  ) {
    const [file] = await this.knex('files')
      .insert({
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize,
      })
      .returning('*');
    return file;
  }

  async generateThumbnail(imageBuffer: Buffer): Promise<Buffer> {
    return await sharp(imageBuffer).resize(200, 200).toBuffer();
  }
}

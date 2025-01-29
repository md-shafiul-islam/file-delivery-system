import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

import { config } from 'dotenv';

config();

@Injectable()
export class FileService {
  private s3: S3;

  private bucketName: string;

  constructor() {
    this.s3 = new S3({
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT_URL,
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      signatureVersion: 'v4',
    });

    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || '';
  }

  uploadFile = async (file: Express.Multer.File) => {
    const uploadParams = {
      Bucket: this.bucketName,
      Key: `uploads/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    return this.s3.upload(uploadParams).promise();
  };

  async generateSignedUrl(fileKey: string) {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucketName,
      Key: fileKey,
      Expires: 60 * 60, // 1 hour expiry
    });
  }
}

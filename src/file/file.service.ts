import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  private s3: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    console.log(
      "this.configService.get('CLOUDFLARE_R2_ENDPOINT_URL') ",
      this.configService.get('CLOUDFLARE_R2_ENDPOINT_URL'),
    );
    this.s3 = new S3Client({
      region: 'auto',
      endpoint:
        this.configService.get('CLOUDFLARE_R2_ENDPOINT_URL') ||
        'default-access-key-id',
      credentials: {
        accessKeyId:
          this.configService.get('CLOUDFLARE_R2_ACCESS_KEY_ID') ||
          'access-key-id',
        secretAccessKey:
          this.configService.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY') ||
          'secret_key',
      },
    });
    this.bucketName = this.configService.get('CLOUDFLARE_R2_BUCKET_NAME')!;
  }

  async uploadFile(file: Express.Multer.File) {
    const fileKey = `uploads/${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    return {
      fileUrl: `${this.configService.get('CLOUDFLARE_R2_ENDPOINT_URL')}/${this.bucketName}/${fileKey}`,
      fileKey,
    };
  }

  async generateUploadUrl(
    fileKey: string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 60 * 5 }); // Expires in 5 minutes
  }

  async generateDownloadUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 60 * 60 }); // Expires in 1 hour
  }
}

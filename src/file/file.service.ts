import { Injectable, NotFoundException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as fs from 'fs';
import knex from 'src/db/knexfile';

@Injectable()
export class FileService {
  private s3: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
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
  /**
   * Encrypt file content
   * @param file Buffer
   * @returns Encrypted Buffer
   */
  private encryptFile(fileBuffer: Buffer): Buffer {
    const encryptionKey =
      this.configService.get('FILE_ENCRYPTION_KEY') ||
      'encryption-key-32-bytes-long';
    const encryptionIV =
      this.configService.get('FILE_ENCRYPTION_IV') || 'random-iv-16-bytes-long';
    const encryptionAlgo =
      this.configService.get('FILE_ENCRYPTION_ALGO') || 'aes-256-cbc';

    const cipher = crypto.createCipheriv(
      encryptionAlgo, // Encryption algorithm
      Buffer.from(encryptionKey, 'utf-8'), // Encryption key (32 bytes)
      Buffer.from(encryptionIV, 'utf-8'), // Initialization Vector (16 bytes)
    );
    let encrypted = cipher.update(fileBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted;
  }

  /**
   * Upload file to S3 with encryption and versioning
   * @param file Express.Multer.File
   */
  async uploadFile(file: Express.Multer.File) {
    const encryptedFile = this.encryptFile(file.buffer);

    // Generate a unique key for versioning
    const fileKey = `uploads/${uuidv4()}-${file.originalname}`;
    const fileUrl = `${this.configService.get('CLOUDFLARE_R2_ENDPOINT_URL')}/${this.bucketName}/${fileKey}`;

    const existingFile = await knex('upload_file')
      .where('original_name', file.originalname)
      .orderBy('version', 'desc')
      .first();

    let version = 1;
    if (existingFile) {
      version += existingFile.version;
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: encryptedFile,
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    await knex('upload_file').insert({
      original_name: file.originalname,
      version,
      file_key: fileKey,
      file_url: fileUrl,
      encrypted: true,
      mime_type: file.mimetype,
    });

    return {
      version,
      fileKey,
      fileUrl,
    };
  }

  async saveMetadata(uploadFile: {
    fileKey: string;
    contentType: string;
    fileUrl: string;
    originalname: string;
  }) {
    try {
      console.log('saveMetadata Req Body, ', uploadFile);
      let version = 1;

      const existingFile = await knex('upload_file')
        .where('original_name', uploadFile.originalname)
        .orderBy('version', 'desc')
        .first();

      if (existingFile) {
        version += existingFile.version;
      }
      const fileMetaData = await knex('upload_file').insert({
        original_name: uploadFile.originalname,
        version,
        file_key: uploadFile.fileKey,
        file_url: uploadFile.fileUrl,
        mime_type: uploadFile.contentType,
        encrypted: false,
      });
      return fileMetaData;
    } catch (error) {
      console.log('Save file metadata Error, ', error);
      return null;
    }
  }

  /**
   * Generate pre-signed URL for uploading files to S3
   * @param fileKey File key for S3
   * @param contentType MIME type of the file
   * @returns Signed URL
   */
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

  /**
   * Generate a download URL for a file stored in S3
   * @param fileKey File key in S3
   * @returns Signed download URL
   */
  async generateDownloadUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 12 * 60 * 60 }); // Expires in 1 hour
  }

  async generateRangDownloadUrl(fileKey: string, range?: string) {
    const file = await knex('upload_file').where({ file_key: fileKey }).first();
    if (!file) throw new NotFoundException('File not found');

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    if (range) {
      command.input.Range = range; // Set range for partial content
    }

    return getSignedUrl(this.s3, command, { expiresIn: 12 * 60 * 60 });
  }

  /**
   * Check if a file exists in S3 (for versioning purposes)
   * @param fileKey File key in S3
   * @returns Boolean indicating file existence
   */
  async fileExists(fileKey: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });
      await this.s3.send(command);
      return true;
    } catch (error) {
      return false; // File doesn't exist
    }
  }

  async getFileByKey(fileKey: string) {
    return await knex('upload_file').where({ file_key: fileKey }).first();
  }
}

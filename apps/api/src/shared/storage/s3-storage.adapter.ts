import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

import type { StoragePort } from './storage.port';

@Injectable()
export class S3StorageAdapter implements StoragePort {
  private readonly logger = new Logger(S3StorageAdapter.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(@Inject(ConfigService) config: ConfigService) {
    this.bucket = config.get('S3_BUCKET', 'petnalia');

    this.client = new S3Client({
      endpoint: config.get('S3_ENDPOINT', 'http://localhost:9000'),
      region: config.get('S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: config.get('S3_ACCESS_KEY_ID', 'minioadmin'),
        secretAccessKey: config.get('S3_SECRET_ACCESS_KEY', 'minioadmin'),
      },
      forcePathStyle: true, // required for MinIO
    });

    void this.ensureBucket();
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn },
    );
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  private async ensureBucket(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Bucket "${this.bucket}" criado.`);
      } catch (err) {
        this.logger.warn(`Não foi possível criar bucket: ${String(err)}`);
      }
    }
  }
}

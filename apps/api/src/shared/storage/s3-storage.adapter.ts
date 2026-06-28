import { Injectable } from '@nestjs/common';

import type { StoragePort } from './storage.port';

@Injectable()
export class S3StorageAdapter implements StoragePort {
  // TODO: inject S3Client from @aws-sdk/client-s3

  async putObject(_key: string, _body: Buffer, _contentType: string): Promise<void> {
    // TODO: implement S3 PutObjectCommand
  }

  async getPresignedUrl(_key: string, _expiresIn?: number): Promise<string> {
    // TODO: implement getSignedUrl from @aws-sdk/s3-request-presigner
    return '';
  }

  async deleteObject(_key: string): Promise<void> {
    // TODO: implement S3 DeleteObjectCommand
  }
}

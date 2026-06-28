export interface StoragePort {
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
  getPresignedUrl(key: string, expiresIn?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
}

export const STORAGE_PORT = Symbol('StoragePort');

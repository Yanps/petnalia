import { type ArgumentMetadata, Injectable, type PipeTransform } from '@nestjs/common';
import { z } from 'zod';

/**
 * Validates a UUID route param with Zod, so a malformed id becomes the standard
 * 422 VALIDATION_ERROR envelope instead of reaching Prisma (which fails with a 500).
 */
@Injectable()
export class UuidParamPipe implements PipeTransform<unknown, string> {
  transform(value: unknown, metadata: ArgumentMetadata): string {
    const name = metadata.data ?? 'id';
    return z.object({ [name]: z.string().uuid() }).parse({ [name]: value })[name] as string;
  }
}

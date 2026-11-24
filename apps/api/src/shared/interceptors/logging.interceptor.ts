import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    // Path only: query strings can carry personal data (e.g. the tutor's coordinates).
    const { method, path } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log({ message: 'request completed', method, path, durationMs: Date.now() - start });
      }),
    );
  }
}

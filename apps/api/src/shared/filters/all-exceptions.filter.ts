import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import type { DomainErrorBody } from '../errors/domain.error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Erro interno. Tente novamente mais tarde.';
    let details: unknown = undefined;

    if (exception instanceof ZodError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      code = 'VALIDATION_ERROR';
      message = 'Dados inválidos.';
      details = exception.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'object' && body !== null && 'code' in body) {
        const domainBody = body as DomainErrorBody;
        code = domainBody.code;
        message = domainBody.message;
      } else {
        code = `HTTP_${status}`;
        message =
          typeof body === 'string'
            ? body
            : ((body as Record<string, unknown>)['message'] as string | undefined) ??
              exception.message;
      }
    } else {
      this.logger.error(
        `Unhandled exception on ${req.method} ${req.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const envelope: Record<string, unknown> = { code, message };
    if (details !== undefined) envelope['details'] = details;

    res.status(status).json({ error: envelope });
  }
}

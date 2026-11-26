import type { LoggerService } from '@nestjs/common';

import { currentRequestId } from './request-context';

type Level = 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'fatal';

/**
 * Machine-readable logger for production: one JSON object per line on stdout, with the
 * request's correlation id. Follows Nest's argument convention — the last string
 * parameter is the context, and `error()` may carry a stack before it.
 */
export class JsonLogger implements LoggerService {
  log(message: unknown, ...params: unknown[]): void {
    this.write('info', message, params);
  }

  error(message: unknown, ...params: unknown[]): void {
    this.write('error', message, params);
  }

  warn(message: unknown, ...params: unknown[]): void {
    this.write('warn', message, params);
  }

  debug(message: unknown, ...params: unknown[]): void {
    this.write('debug', message, params);
  }

  verbose(message: unknown, ...params: unknown[]): void {
    this.write('verbose', message, params);
  }

  fatal(message: unknown, ...params: unknown[]): void {
    this.write('fatal', message, params);
  }

  private write(level: Level, message: unknown, params: readonly unknown[]): void {
    const rest = [...params];
    const context = typeof rest.at(-1) === 'string' ? (rest.pop() as string) : undefined;
    const stack = level === 'error' && typeof rest[0] === 'string' ? (rest.shift() as string) : undefined;

    const entry: Record<string, unknown> = {
      level,
      time: new Date().toISOString(),
      ...(context && { context }),
      requestId: currentRequestId(),
    };
    if (message instanceof Error) {
      entry['message'] = message.message;
      entry['stack'] = message.stack;
    } else if (typeof message === 'object' && message !== null) {
      Object.assign(entry, message);
    } else {
      entry['message'] = String(message);
    }
    if (stack) entry['stack'] = stack;
    if (rest.length > 0) entry['extra'] = rest;

    process.stdout.write(`${JSON.stringify(entry)}\n`);
  }
}

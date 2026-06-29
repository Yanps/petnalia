import { HttpException, HttpStatus } from '@nestjs/common';

export interface DomainErrorBody {
  readonly code: string;
  readonly message: string;
}

export class DomainError extends HttpException {
  public readonly code: string;

  constructor(
    code: string,
    message: string,
    status: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
  ) {
    super({ code, message } satisfies DomainErrorBody, status);
    this.code = code;
  }
}

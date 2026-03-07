import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errorCode: string;
  path?: string;
  details?: unknown;
}

export abstract class BaseException extends HttpException {
  abstract readonly errorCode: string;

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly details?: unknown,
  ) {
    super(message, statusCode);
  }

  toJSON(): ErrorResponse {
    return {
      statusCode: this.getStatus(),
      message: this.message,
      errorCode: this.errorCode,
      details: this.details,
    };
  }
}

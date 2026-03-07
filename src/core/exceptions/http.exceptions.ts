import { HttpStatus } from "@nestjs/common";

import { BaseException } from "./base.exception";

export class NotFoundException extends BaseException {
  readonly errorCode = "RESOURCE_NOT_FOUND";

  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedException extends BaseException {
  readonly errorCode = "UNAUTHORIZED";

  constructor(message = "Unauthorized access") {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends BaseException {
  readonly errorCode = "FORBIDDEN";

  constructor(message = "Access forbidden") {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class BadRequestException extends BaseException {
  readonly errorCode = "BAD_REQUEST";

  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}

export class ConflictException extends BaseException {
  readonly errorCode = "CONFLICT";

  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

export class InternalServerErrorException extends BaseException {
  readonly errorCode = "INTERNAL_SERVER_ERROR";

  constructor(message = "Internal server error", details?: unknown) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }
}

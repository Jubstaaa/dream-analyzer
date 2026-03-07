import { HttpStatus } from "@nestjs/common";

import { BaseException } from "./base.exception";

export class InvalidCredentialsException extends BaseException {
  readonly errorCode = "INVALID_CREDENTIALS";

  constructor() {
    super("Invalid email or password", HttpStatus.UNAUTHORIZED);
  }
}

export class EmailAlreadyExistsException extends BaseException {
  readonly errorCode = "EMAIL_ALREADY_EXISTS";

  constructor(email: string) {
    super(`Email '${email}' is already registered`, HttpStatus.CONFLICT);
  }
}

export class InvalidTokenException extends BaseException {
  readonly errorCode = "INVALID_TOKEN";

  constructor(message = "Invalid or expired token") {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class PremiumRequiredException extends BaseException {
  readonly errorCode = "PREMIUM_REQUIRED";

  constructor(feature: string) {
    super(
      `Premium subscription required to access ${feature}`,
      HttpStatus.FORBIDDEN,
    );
  }
}

export class RateLimitExceededException extends BaseException {
  readonly errorCode = "RATE_LIMIT_EXCEEDED";

  constructor(retryAfter?: number) {
    super("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS, {
      retryAfter,
    });
  }
}

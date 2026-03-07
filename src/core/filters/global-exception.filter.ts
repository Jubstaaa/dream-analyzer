import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { I18nContext } from "nestjs-i18n";

import { BaseException, ErrorResponse } from "@core/exceptions";
import { LoggerService } from "@core/logger";

@Catch(HttpException, BaseException, Error)
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(
    exception: HttpException | BaseException | Error,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const i18n = I18nContext.current(host);

    let errorResponse: ErrorResponse;

    if (exception instanceof BaseException) {
      const baseError = exception.toJSON();
      errorResponse = {
        ...baseError,
        message: this.translateErrorMessage(
          baseError.errorCode,
          baseError.message,
          i18n,
        ),
        path: request.url,
      };
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      errorResponse = {
        statusCode: status,
        message:
          typeof exceptionResponse === "string"
            ? exceptionResponse
            : (exceptionResponse as { message?: string }).message ||
              "An error occurred",
        errorCode: "HTTP_EXCEPTION",
        path: request.url,
      };
    } else {
      const errorMessage =
        exception instanceof Error ? exception.message : "Unknown error";

      this.logger.error(
        "Unhandled exception",
        exception instanceof Error ? exception.stack : undefined,
        "GlobalExceptionFilter",
      );

      errorResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
        errorCode: "INTERNAL_SERVER_ERROR",
        path: request.url,
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      };
    }

    this.logger.error(
      `${request.method} ${request.url} - ${errorResponse.statusCode} ${errorResponse.message}`,
      undefined,
      "GlobalExceptionFilter",
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private translateErrorMessage(
    errorCode: string,
    defaultMessage: string,
    i18n: I18nContext | undefined,
  ): string {
    if (!i18n) {
      return defaultMessage;
    }

    const errorKeyMap: Record<string, string> = {
      INVALID_CREDENTIALS: "common.errors.invalidCredentials",
      EMAIL_ALREADY_EXISTS: "common.errors.emailAlreadyExists",
      USER_NOT_FOUND: "common.errors.userNotFound",
      NOT_FOUND: "common.errors.notFound",
      UNAUTHORIZED: "common.errors.unauthorized",
      FORBIDDEN: "common.errors.forbidden",
      INTERNAL_SERVER_ERROR: "common.errors.internalError",
    };

    const key = errorKeyMap[errorCode];
    if (!key) {
      return defaultMessage;
    }

    const translated = String(i18n.t(key));
    return translated === key ? defaultMessage : translated;
  }
}

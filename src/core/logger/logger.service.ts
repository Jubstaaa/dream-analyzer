import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import * as winston from "winston";

import { env } from "@config";

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: env.NODE_ENV === "production" ? "info" : "debug",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      defaultMeta: { service: "dream-analyzer" },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, context, ...meta }) => {
                const ctx = context ? `[${context}]` : "";
                const metaStr = Object.keys(meta).length
                  ? JSON.stringify(meta)
                  : "";
                return `${timestamp} ${level} ${ctx} ${message} ${metaStr}`;
              },
            ),
          ),
        }),
      ],
    });

    if (env.NODE_ENV === "production") {
      this.logger.add(
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
        }),
      );
      this.logger.add(
        new winston.transports.File({
          filename: "logs/combined.log",
        }),
      );
    }
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }
}

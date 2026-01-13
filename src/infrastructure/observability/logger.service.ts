import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { trace } from '@opentelemetry/api';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    });
  }

  private getTraceContext(): Record<string, string> {
    const span = trace.getActiveSpan();
    if (span) {
      const spanContext = span.spanContext();
      return {
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
      };
    }
    return {};
  }

  log(message: string, context?: string) {
    this.logger.info(message, {
      context,
      ...this.getTraceContext(),
    });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, {
      trace,
      context,
      ...this.getTraceContext(),
    });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, {
      context,
      ...this.getTraceContext(),
    });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, {
      context,
      ...this.getTraceContext(),
    });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, {
      context,
      ...this.getTraceContext(),
    });
  }
}

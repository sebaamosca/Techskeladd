import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { OdooConnectionException } from '../exceptions/odoo-connection.exception';
import { ErrorResponseDto } from '../dto/error-response.dto';

/**
 * Catches every unhandled exception and returns a consistent JSON envelope.
 * Three cases: OdooConnectionException (503 + Retry-After),
 * HttpException (original status), Unknown errors (500, internals never exposed).
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(GlobalExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { id: string }>();
    const res = ctx.getResponse<Response>();

    const correlationId: string = req.id ?? 'unknown';
    const timestamp = new Date().toISOString();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof OdooConnectionException) {
      statusCode = exception.getStatus();
      message = exception.message;
      res.setHeader('Retry-After', String(exception.retryAfter));

      this.logger.warn(
        { correlationId, method: req.method, url: req.url },
        `Odoo connection failure: ${message}`,
      );
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const responseBody = exception.getResponse();
      message =
        typeof responseBody === 'string'
          ? responseBody
          : ((responseBody as { message?: string }).message ??
            exception.message);

      this.logger.warn(
        { correlationId, method: req.method, url: req.url, statusCode },
        `HTTP exception: ${message}`,
      );
    } else {
      const err =
        exception instanceof Error ? exception : new Error(String(exception));

      this.logger.error(
        {
          correlationId,
          method: req.method,
          url: req.url,
          stack: err.stack,
        },
        `Unhandled exception: ${err.message}`,
      );
    }

    const body: ErrorResponseDto = {
      statusCode,
      message,
      correlationId,
      timestamp,
    };

    res.status(statusCode).json(body);
  }
}

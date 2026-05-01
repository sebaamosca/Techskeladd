import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';

/**
 * Reads the correlation ID that Pino already assigned to `req.id` via
 * `genReqId` in AppModule, and echoes it back in the `X-Correlation-Id`
 * response header. Consumers (e.g. n8n) can then use this header to
 * correlate their own logs with the API logs.
 */
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { id: string }>();
    const res = context.switchToHttp().getResponse<Response>();

    res.setHeader('X-Correlation-Id', req.id);

    return next.handle();
  }
}

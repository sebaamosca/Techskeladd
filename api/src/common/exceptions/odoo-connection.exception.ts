import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Thrown when the Odoo XML-RPC connection fails (network error, auth failure,
 * or unexpected response). Defaults to 503 so upstream callers and load
 * balancers know the dependency is temporarily unavailable, not the API itself.
 */
export class OdooConnectionException extends HttpException {
  readonly retryAfter: number;

  constructor(message: string, retryAfter: number = 30) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
    this.retryAfter = retryAfter;
  }
}

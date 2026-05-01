import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Global guard that requires a valid `X-API-Key` header on every request.
 * Routes decorated with `@Public()` are exempt (e.g. health checks).
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly apiKey: string;

  constructor(
    private readonly reflector: Reflector,
    configService: ConfigService,
  ) {
    this.apiKey = configService.getOrThrow<string>('API_KEY');
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const key = req.headers['x-api-key'];

    if (key !== this.apiKey) {
      throw new UnauthorizedException('Missing or invalid API key');
    }

    return true;
  }
}

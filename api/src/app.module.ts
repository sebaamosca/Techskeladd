import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import { validateEnv } from './config/env.validation';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ApiKeyGuard } from './common/guards/api-key.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),

    LoggerModule.forRootAsync({
      useFactory: () => {
        const isDevelopment = process.env['NODE_ENV'] !== 'production';

        return {
          pinoHttp: {
            // Reuse incoming X-Correlation-Id so upstream callers (n8n)
            // can trace a request end-to-end.
            genReqId: (req) => {
              const existingId = req.headers['x-correlation-id'];
              return typeof existingId === 'string' && existingId.length > 0
                ? existingId
                : uuidv4();
            },

            customProps: (req) => ({
              correlationId: req.id,
            }),

            transport: isDevelopment
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: false,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                }
              : undefined,

            level: isDevelopment ? 'debug' : 'info',
          },
        };
      },
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: ApiKeyGuard },
    { provide: APP_INTERCEPTOR, useClass: CorrelationIdInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}

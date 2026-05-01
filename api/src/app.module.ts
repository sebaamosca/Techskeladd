import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    // validate: validateEnv runs synchronously at startup — the app won't
    // boot if a required variable is missing or has the wrong type.
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
            // Reuse the incoming X-Correlation-Id header when present so
            // upstream callers (e.g. n8n) can trace a request end-to-end.
            // Fall back to a generated UUID when the header is absent.
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
})
export class AppModule {}

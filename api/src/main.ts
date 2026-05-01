import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  const config = app.get(ConfigService);
  const port = config.get<number>('API_PORT', 3000);
  const env = config.get<string>('NODE_ENV', 'development');

  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application listening on port ${port} [${env}]`, 'Bootstrap');
}

void bootstrap();

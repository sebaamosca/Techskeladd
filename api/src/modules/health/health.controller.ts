import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import * as express from 'express';
import { HealthService } from './health.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  async getHealth(@Res() res: express.Response): Promise<void> {
    const health = await this.healthService.checkHealth();

    const statusCode =
      health.status === 'UP' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(statusCode).json(health);
  }
}

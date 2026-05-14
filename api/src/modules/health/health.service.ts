import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { OdooConnectionService } from '../odoo/odoo-connection.service';

export interface HealthResponse {
  status: 'UP' | 'DOWN';
  timestamp: string;
  services: {
    api: 'OK' | 'FAIL';
    odoo: 'OK' | 'FAIL';
  };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly odooConnectionService: OdooConnectionService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(HealthService.name);
  }

  async checkHealth(): Promise<HealthResponse> {
    const apiStatus = 'OK';

    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<boolean>((resolve) => {
      timeoutId = setTimeout(() => {
        this.logger.warn('Odoo health check timed out after 5s');
        resolve(false);
      }, 5000);
    });

    const odooPing = await Promise.race([
      this.odooConnectionService.ping().then((res) => {
        clearTimeout(timeoutId);
        return res;
      }),
      timeoutPromise,
    ]);

    const odooStatus = odooPing ? 'OK' : 'FAIL';
    const overallStatus = odooStatus === 'OK' ? 'UP' : 'DOWN';

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        api: apiStatus,
        odoo: odooStatus,
      },
    };

    if (overallStatus === 'DOWN') {
      this.logger.error({ response }, 'Health check failed');
    } else {
      this.logger.info({ response }, 'Health check passed');
    }

    return response;
  }
}

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import Odoo from 'odoo-xmlrpc';
import { OdooConnectionException } from '../../common/exceptions/odoo-connection.exception';

@Injectable()
export class OdooConnectionService implements OnModuleDestroy {
  private client: Odoo | null = null;
  private isConnected = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(OdooConnectionService.name);
  }

  onModuleDestroy() {
    this.client = null;
    this.isConnected = false;
  }

  private async getClient(): Promise<Odoo> {
    if (this.isConnected && this.client) {
      return this.client;
    }

    const url = this.configService.getOrThrow<string>('ODOO_URL');
    const db = this.configService.getOrThrow<string>('ODOO_DB');
    const username = this.configService.getOrThrow<string>('ODOO_USERNAME');
    const password = this.configService.getOrThrow<string>('ODOO_PASSWORD');

    const parsedUrl = new URL(url);
    const port = parsedUrl.port
      ? parseInt(parsedUrl.port, 10)
      : parsedUrl.protocol === 'https:'
        ? 443
        : 80;

    const client = new Odoo({
      url: parsedUrl.hostname,
      port,
      db,
      username,
      password,
      protocol: parsedUrl.protocol.replace(':', ''),
    });
    this.client = client;

    return new Promise((resolve, reject) => {
      client.connect((err: Error) => {
        if (err) {
          this.logger.error({ err }, 'Failed to connect to Odoo XML-RPC');
          return reject(
            new OdooConnectionException('Failed to connect to Odoo', 60),
          );
        }
        this.isConnected = true;
        this.logger.info('Connected to Odoo XML-RPC');
        resolve(client);
      });
    });
  }

  async call<T>(model: string, method: string, args: unknown[]): Promise<T> {
    const client = await this.getClient();

    this.logger.debug({ model, method, args }, 'Calling Odoo XML-RPC');

    return new Promise((resolve, reject) => {
      client.execute_kw(model, method, args, (err: Error, value: any) => {
        if (err) {
          this.logger.error({ err, model, method }, 'Odoo XML-RPC call failed');
          return reject(
            new OdooConnectionException(`Odoo call failed: ${err.message}`, 60),
          );
        }
        resolve(value as T);
      });
    });
  }
}

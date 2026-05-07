import { plainToInstance } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  Max,
  IsNotEmpty,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  API_PORT: number = 3000;

  @IsUrl({ require_tld: false })
  ODOO_URL!: string;

  @IsString()
  @IsNotEmpty()
  ODOO_DB!: string;

  @IsString()
  @IsNotEmpty()
  ODOO_USERNAME!: string;

  @IsString()
  @IsNotEmpty()
  ODOO_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  API_KEY!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  THROTTLE_TTL: number = 60;

  @IsOptional()
  @IsNumber()
  @Min(1)
  THROTTLE_LIMIT: number = 10;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('\n  ');

    throw new Error(
      `[Config] Environment validation failed:\n  ${messages}\n` +
        'Fix the above variables in your .env file before starting the application.',
    );
  }

  return validatedConfig;
}

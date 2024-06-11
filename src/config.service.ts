import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfig } from '@nestjs/config';

@Injectable()
export class ConfigService {
  USE_COMMERCE_TOOLS = this.nestConfig.get('USE_COMMERCE_TOOLS') === 'true';
  COMMERCE_TOOLS_PROJECT_KEY = this.nestConfig.get(
    'COMMERCE_TOOLS_PROJECT_KEY',
  );
  COMMERCE_TOOLS_CLIENT_API_URL = this.nestConfig.get(
    'COMMERCE_TOOLS_CLIENT_API_URL',
  );

  COMMERCE_TOOLS_URL = `${this.COMMERCE_TOOLS_CLIENT_API_URL}/${this.COMMERCE_TOOLS_PROJECT_KEY}`;

  COMMERCE_AUTH_TOKEN = this.nestConfig.get('COMMERCE_AUTH_TOKEN');

  CONTENT_STACK_API_KEY = this.nestConfig.get('CONTENT_STACK_API_KEY');
  CONTENT_STACK_DELIVERY_TOKEN = this.nestConfig.get(
    'CONTENT_STACK_DELIVERY_TOKEN',
  );
  CONTENT_STACK_BASE_URL = this.nestConfig.get('CONTENT_STACK_BASE_URL');

  constructor(private nestConfig: NestConfig) {}
}

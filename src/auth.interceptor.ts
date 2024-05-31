import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from './config.service';

import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(private config: ConfigService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (this.config.USE_COMMERCE_TOOLS) {
      const token = this.config.COMMERCE_AUTH_TOKEN;
      request.headers['Authorization'] = `Bearer ${token}`;
    }

    return next.handle();
  }
}

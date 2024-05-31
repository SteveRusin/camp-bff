import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AxiosError } from 'axios';

@Catch(AxiosError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: AxiosError, host: ArgumentsHost) {
    console.log('ExceptionFilter', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.response?.status || 500;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

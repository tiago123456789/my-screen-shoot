import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  Inject,
} from '@nestjs/common';
import { ApiException } from './api.exception';
import { Request, Response } from 'express';
import { ILoggerAdapter } from '../adapters/logger/ilogger.adapter';

@Catch(Error)
export class ApplicationExceptionFilters implements ExceptionFilter {
  constructor(@Inject('ILoggerAdapter') private logger: ILoggerAdapter) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ApiException) {
      response.status(exception.getCode()).json({
        statusCode: exception.getCode(),
        message: exception.message,
      });
      return;
    }

    if (exception instanceof BadRequestException) {
      response.status(400).json(exception.getResponse());
      return;
    }

    this.logger.error({
      timestamp: new Date().toISOString(),
      error: exception.message,
    });
    response.status(500).json({ message: 'Internal server error' });
  }
}

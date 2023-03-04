import { ILoggerAdapter } from './ilogger.adapter';

import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';

@Injectable()
export class WinstonLoggerAdapter implements ILoggerAdapter {
  constructor(@Inject('winston') private logger: Logger) {}

  info(data: string | { [key: string]: any }): void {
    this.logger.info(data);
  }
  error(data: string | { [key: string]: any }): void {
    this.logger.error(data);
  }
}

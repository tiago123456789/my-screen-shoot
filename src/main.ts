import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApplicationExceptionFilters } from './common/exceptions/application-exception.filters';
import * as express from 'express';
import { join } from 'path';
import { ExpressAdapter } from '@bull-board/express';
import * as Queue from 'bull';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { createBullBoard } from '@bull-board/api';
import { QUEUES } from './common/constants/App';
import { NewrelicInterceptor } from './new-relic.interceptor';

import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/configs/winston.config';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';
import { ILoggerAdapter } from './common/adapters/logger/ilogger.adapter';

async function bootstrap() {
  const logger = WinstonModule.createLogger(winstonConfig);
  const app = await NestFactory.create(AppModule, { logger });
  const winstonLoggerAdapter = app.get<ILoggerAdapter>('ILoggerAdapter');
  app.useGlobalFilters(new ApplicationExceptionFilters(winstonLoggerAdapter));
  app.useGlobalPipes(new ValidationPipe());
  app.use(express.static(join(__dirname, '../screenshoots_images')));
  app.useGlobalInterceptors(new NewrelicInterceptor());
  app.useGlobalInterceptors(new LoggerInterceptor(winstonLoggerAdapter));

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/bull-board');
  const queueScreenShoot = new Queue(QUEUES.SCREEN_SHOOT);
  const queueWebhook = new Queue(QUEUES.WEBHOOK);
  createBullBoard({
    queues: [
      // @ts-ignore
      new BullMQAdapter(queueScreenShoot),
      // @ts-ignore
      new BullMQAdapter(queueWebhook),
    ],
    serverAdapter,
  });

  app.use('/bull-board', serverAdapter.getRouter());
  await app.listen(3000);
}
bootstrap();

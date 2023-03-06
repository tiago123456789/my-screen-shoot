import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApikeyModule } from '../apikey/apikey.module';
import { QUEUES } from '../common/constants/App';
import { UsersModule } from '../users/users.module';
import { BullProducerQueueAdapter } from './adapters/queue/bull-producer-queue.adapter';
import { FileSystemAdapter } from './adapters/storage/file-system.adapter';
import { PuppeteerScreenShooterAdapter } from './adapters/screen-shooter/puppeteer-screenshooter.adapter';
import { ScreenShotRepository } from './repositories/screenshot.repository';
import { ScreenShotConsumer } from './consumers/screenshot.consumer';
import { ScreenshotController } from './screenshot.controller';
import { ScreenShot } from './screenshot.entity';
import { ScreenShotScheduler } from './screenshot.scheduler';
import { ScreenshotService } from './services/screenshot.service';
import { WebhookConsumer } from './consumers/webhook.consumer';
import { AxiosHttpAdapter } from './adapters/http/axios-http.adapter';
import { WebhookService } from './services/webhook.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    ApikeyModule,
    UsersModule,
    TypeOrmModule.forFeature([ScreenShot]),
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: QUEUES.SCREEN_SHOOT,
    }),
    BullModule.registerQueue({
      name: QUEUES.WEBHOOK,
    }),
    CommonModule,
  ],
  controllers: [ScreenshotController],
  providers: [
    ScreenshotService,
    ScreenShotScheduler,
    ScreenShotConsumer,
    WebhookConsumer,
    WebhookService,
    {
      provide: 'IScreenShooterAdapter',
      useClass: PuppeteerScreenShooterAdapter,
    },
    {
      provide: 'IStorageAdapter',
      useClass: FileSystemAdapter,
    },
    {
      provide: 'IScreenShotRepository',
      useClass: ScreenShotRepository,
    },
    {
      provide: 'iProducerQueueAdapter',
      useClass: BullProducerQueueAdapter,
    },
    {
      provide: 'IHttpAdapter',
      useClass: AxiosHttpAdapter,
    },
  ],
})
export class ScreenshotModule {}

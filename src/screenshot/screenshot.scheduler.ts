import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ScreenshotService } from './services/screenshot.service';

@Injectable()
export class ScreenShotScheduler {
  constructor(private screenshotService: ScreenshotService) {}

  @Cron('*/1 * * * *')
  handleCron() {
    this.screenshotService.publishScheduledScreenShoots();
  }
}

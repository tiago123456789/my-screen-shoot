import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ScreenshotService } from './services/screenshot.service';

@Injectable()
export class ScreenShotScheduler {
  constructor(private screenshotService: ScreenshotService) {}

  @Cron('*/1 * * * *')
  handleCron() {
    const isDisableScheduleTasks = process.env.DISABLE_SCHEDULE_TASKS == 'true';
    if (isDisableScheduleTasks) {
      return;
    }
    this.screenshotService.publishScheduledScreenShoots();
  }
}

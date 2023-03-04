import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { HEADERS, QUEUES } from 'src/common/constants/App';
import { ScreenShotMessageQueue } from '../adapters/queue/screenshot-message-queue';
import { ScreenshotService } from '../services/screenshot.service';

@Processor(QUEUES.SCREEN_SHOOT)
export class ScreenShotConsumer {
  constructor(private screenshotService: ScreenshotService) {}

  @Process()
  async transcode(job: Job<ScreenShotMessageQueue>) {
    const message: ScreenShotMessageQueue = job.data;
    await this.screenshotService.takeScheduledScreenShoot(message);
    return {};
  }
}

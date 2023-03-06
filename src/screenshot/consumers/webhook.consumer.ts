import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { QUEUES } from '../../common/constants/App';
import { WebhookMessageQueue } from '../adapters/queue/webhook-message-queue';
import { WebhookService } from '../services/webhook.service';

@Processor(QUEUES.WEBHOOK)
export class WebhookConsumer {
  constructor(private webhookService: WebhookService) {}
  @Process()
  async transcode(job: Job<WebhookMessageQueue>) {
    const message: WebhookMessageQueue = job.data;
    await this.webhookService.trigger(message);
    return {};
  }
}

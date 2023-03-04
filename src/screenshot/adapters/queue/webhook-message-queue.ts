import { MessageQueue } from './message-queue';

export class WebhookMessageQueue extends MessageQueue {
  id: string;
  link: string;
  url: string;
}

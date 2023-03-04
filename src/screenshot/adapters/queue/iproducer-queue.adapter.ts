import { MessageQueue } from './message-queue';

export interface iProducerQueueAdapter {
  publish(
    queue: string,
    data: MessageQueue,
    options: { [key: string]: any } | undefined,
  ): Promise<void>;

  publishInBatch(
    queue: string,
    data: MessageQueue[],
    options: { [key: string]: any } | undefined,
  ): Promise<void>;
}

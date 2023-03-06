import { iProducerQueueAdapter } from './iproducer-queue.adapter';
import { MessageQueue } from './message-queue';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { QUEUES } from '../../../common/constants/App';

@Injectable()
export class BullProducerQueueAdapter implements iProducerQueueAdapter {
  private mapQueues: { [key: string]: any };

  constructor(
    @InjectQueue(QUEUES.SCREEN_SHOOT) private queueScreenShoot: Queue,
    @InjectQueue(QUEUES.WEBHOOK) private queueWebhook: Queue,
  ) {
    this.mapQueues = {
      [QUEUES.SCREEN_SHOOT]: this.queueScreenShoot,
      [QUEUES.WEBHOOK]: this.queueWebhook,
    };
  }

  private getQueue(name: string) {
    const queue: Queue = this.mapQueues[name];
    if (!queue) {
      throw new Error('Queue not exist');
    }
    return queue;
  }

  async publish(
    queue: string,
    data: MessageQueue,
    options: { [key: string]: any },
  ): Promise<void> {
    options = options || {};
    options.removeOnComplete = true;
    await this.getQueue(queue).add(data, options || {});
  }

  async publishInBatch(
    queue: string,
    data: MessageQueue[],
    options: { [key: string]: any } | undefined,
  ): Promise<void> {
    options = options || {};
    options.removeOnComplete = true;
    const items = data.map((item) => {
      return {
        data: item,
        opts: options,
      };
    });
    await this.getQueue(queue).addBulk(items);
  }
}

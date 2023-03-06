import { Inject, Injectable } from '@nestjs/common';
import { ILoggerAdapter } from '../../common/adapters/logger/ilogger.adapter';
import { IHttpAdapter } from '../adapters/http/ihttp.adapter';
import { WebhookMessageQueue } from '../adapters/queue/webhook-message-queue';
import { IScreenShotRepository } from '../repositories/iscreenshot.repository';

@Injectable()
export class WebhookService {
  constructor(
    @Inject('IHttpAdapter') private httpClient: IHttpAdapter,
    @Inject('ILoggerAdapter')
    private logger: ILoggerAdapter,
    @Inject('IScreenShotRepository')
    private repository: IScreenShotRepository,
  ) {}

  async trigger(data: WebhookMessageQueue) {
    try {
      this.logger.info({
        timestamp: new Date().toISOString(),
        message: `Sending request to webhook url to notify took scheduled screen shoot to the register with id ${data.id}`,
      });

      const response = await this.httpClient.post(data.url, {
        id: data.id,
        link: data.link,
      });
      this.logger.info({
        timestamp: new Date().toISOString(),
        message: `Sended request to webhook url to notify took scheduled screen shoot to the register with id ${data.id}`,
      });

      if (response.status != 200) {
        throw new Error(
          'Error returned the request => ',
          // @ts-ignore
          JSON.stringify(response.data),
        );
      }

      this.logger.info({
        timestamp: new Date().toISOString(),
        message: `Getting screenShot by id to the register with id ${data.id}`,
      });
      const screenShoot = await this.repository.findById(data.id);
      screenShoot.setIsWebhookTriggered(true);
      this.logger.info({
        timestamp: new Date().toISOString(),
        message: `Updating column is_webhook_triggered to true to the register with id ${data.id}`,
      });
      await this.repository.update(screenShoot);
      this.logger.info({
        timestamp: new Date().toISOString(),
        message: `Updated the screenShot to the register with id ${data.id}`,
      });
    } catch (error) {
      this.logger.error({
        timestamp: new Date().toISOString(),
        error: error.message,
      });
      throw error;
    }
  }
}

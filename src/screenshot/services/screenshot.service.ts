import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { IScreenShooterAdapter } from '../adapters/screen-shooter/iscreenshooter.adapter';
import { IStorageAdapter } from '../adapters/storage/istorage.adapter';
import { ParamsTakeScreenShoot } from '../adapters/screen-shooter/params-take-screen-shoot';
import { OutputScreenDto } from '../dtos/output-screenshoot.dto';
import { IScreenShotRepository } from '../repositories/iscreenshot.repository';
import { ScreenShot } from '../screenshot.entity';
import { OutputScreenshootPaginatedDto } from '../dtos/output-screenshoot-paginated.dto';
import { Pagination } from '../../common/types/pagination';
import { iProducerQueueAdapter } from '../adapters/queue/iproducer-queue.adapter';
import { ScreenShotMessageQueue } from '../adapters/queue/screenshot-message-queue';
import { QUEUES } from 'src/common/constants/App';
import { WebhookMessageQueue } from '../adapters/queue/webhook-message-queue';
import { OutputMetricsUsageDto } from '../dtos/output-metrics-usage.dto';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { ILoggerAdapter } from 'src/common/adapters/logger/ilogger.adapter';

@Injectable()
export class ScreenshotService {
  constructor(
    @Inject('IScreenShooterAdapter')
    private screenShooter: IScreenShooterAdapter,
    @Inject('IStorageAdapter')
    private storage: IStorageAdapter,
    @Inject('IScreenShotRepository')
    private repository: IScreenShotRepository,
    @Inject('iProducerQueueAdapter')
    private producerQueue: iProducerQueueAdapter,
    @Inject('ILoggerAdapter')
    private logger: ILoggerAdapter,
    private userService: UsersService,
  ) {}

  private async takeScreenShoot(
    url: string,
    params: ParamsTakeScreenShoot,
  ): Promise<string> {
    const binary: string | Buffer = await this.screenShooter.takeScreenShot(
      url,
      params,
    );
    return this.storage.store(params.filename, binary);
  }

  async getMetricsUsageLast30Days(userId): Promise<OutputMetricsUsageDto[]> {
    const registers = await this.repository.getMetricsUsageLast30Days(userId);
    return registers.map((item) => {
      return new OutputMetricsUsageDto(item.updated_at, item.total);
    });
  }

  find10Last(userId): Promise<ScreenShot[]> {
    return this.repository.find10Last(userId);
  }

  async publishScheduledScreenShoots() {
    try {
      this.logger.info({
        timestamp: new Date().toISOString(),
        message: 'Start process publish scheduled screen shoots to queue',
      });
      const screenShoots = await this.repository.findAllScheduled();

      if (screenShoots.length === 0) {
        this.logger.info({
          timestamp: new Date().toISOString(),
          message:
            "Finished process beause don't have message to publish scheduled screen shoots to queue",
        });
        return;
      }

      const messages: ScreenShotMessageQueue[] = screenShoots.map((item) => {
        return {
          params: JSON.parse(item.getParams()),
          id: item.getId(),
        };
      });

      this.logger.info({
        timestamp: new Date().toISOString(),
        message: 'Publishing messages to queue',
      });
      await this.producerQueue.publishInBatch(QUEUES.SCREEN_SHOOT, messages, {
        attempts: 2,
      });
      this.logger.info({
        timestamp: new Date().toISOString(),
        message: 'Published messages to queue',
      });
    } catch (error) {
      this.logger.error({
        timestamp: new Date().toISOString(),
        error: error.message,
      });
      throw error;
    }
  }

  async takeScheduledScreenShoot(
    screenShotMessageQueue: ScreenShotMessageQueue,
  ): Promise<void> {
    try {
      this.logger.info({
        timestamp: new Date().toISOString(),
        message: `Starting take scheduled screen shoot the register with id ${screenShotMessageQueue.id}`,
      });
      console.log('Starting take scheduled screen shoot');
      const screenShot = await this.repository.findById(
        screenShotMessageQueue.id,
      );

      if (!screenShot) {
        throw new Error('ScreenShot not exist');
      }

      if (screenShot.getLink()) {
        this.logger.info({
          timestamp: new Date().toISOString(),
          message: `Aready take scheduled screen shoot before to the register with id ${screenShotMessageQueue.id}`,
        });
        return;
      }

      this.logger.info({
        timestamp: new Date().toISOString(),
        message: `Taking scheduled screen shoot the register with id ${screenShotMessageQueue.id}`,
      });

      this.logger.info({
        timestamp: new Date().toISOString(),
        message: `Storing scheduled screen shoot the register with id ${screenShotMessageQueue.id}`,
      });
      const link = await this.takeScreenShoot(
        screenShotMessageQueue.params.url,
        screenShotMessageQueue.params,
      );
      screenShot.setLink(link);
      screenShot.setUpdatedAt(new Date());

      this.logger.info({
        timestamp: new Date().toISOString(),
        message: `Updating scheduled screen shoot the register with id ${screenShotMessageQueue.id}`,
      });
      await this.repository.update(screenShot);
      this.logger.info({
        timestamp: new Date().toISOString(),
        message: `Updated scheduled screen shoot the register with id ${screenShotMessageQueue.id}`,
      });

      if (!screenShot.getWebhookUrl()) {
        this.logger.info({
          timestamp: new Date().toISOString(),
          message: `Finished process scheduled screen shoot the register with id ${screenShotMessageQueue.id}`,
        });
        return;
      }

      this.logger.info({
        timestamp: new Date().toISOString(),
        message: `Publishing message to notify via webhook about scheduled screen shoot the register with id ${screenShotMessageQueue.id}`,
      });
      const message: WebhookMessageQueue = {
        url: screenShot.getWebhookUrl(),
        link: screenShot.getLink(),
        id: screenShot.getId(),
      };
      await this.producerQueue.publish(QUEUES.WEBHOOK, message, {
        attempts: 2,
      });

      this.logger.info({
        timestamp: new Date().toISOString(),
        message: `Finished process scheduled screen shoot the register with id ${screenShotMessageQueue.id}`,
      });
    } catch (error) {
      this.logger.error({
        timestamp: new Date().toISOString(),
        error: error.message,
      });
      throw error;
    }
  }

  async create(
    url: string,
    userId: string,
    params: ParamsTakeScreenShoot,
  ): Promise<OutputScreenDto> {
    params.filename = `./screenshoots_images/${new Date().getTime()}${
      params.filename
    }`;

    let link;
    if (!params.scheduledAt) {
      link = await this.takeScreenShoot(url, params);
    }

    const screenShot = new ScreenShot();
    screenShot.setParams(JSON.stringify(params));
    const user = await this.userService.findUserById(userId);
    screenShot.setUser(user);

    if (!params.scheduledAt) {
      screenShot.setLink(link);
    }

    if (params.scheduledAt) {
      screenShot.setScheduledAt(new Date(params.scheduledAt));
    }

    if (params.webhookUrl) {
      screenShot.setWebhookUrl(params.webhookUrl);
    }

    await this.repository.save(screenShot);

    const outputScreenDto = new OutputScreenDto();
    if (!params.scheduledAt) {
      outputScreenDto.link = link;
    }
    return outputScreenDto;
  }

  async findAllByUserId(
    userId: string,
    pagination: Pagination,
  ): Promise<OutputScreenshootPaginatedDto> {
    const [screenShoots, totalItems] = await this.repository.findAllByUserId(
      userId,
      pagination.getPage(),
      pagination.getItemsPerPage(),
    );

    const outputScreenshootPaginated = new OutputScreenshootPaginatedDto();
    outputScreenshootPaginated.data = screenShoots;
    outputScreenshootPaginated.itemsPerPage = pagination.getItemsPerPage();
    outputScreenshootPaginated.total = totalItems;
    outputScreenshootPaginated.page = pagination.getPageOriginal();

    return outputScreenshootPaginated;
  }

  async findById(id: string, userId: string): Promise<ScreenShot> {
    const register = await this.repository.findById(id);
    if (!register) {
      throw new NotFoundException('ScreenShoot not found', 404);
    }

    if (register && register.getUser().getId() != userId) {
      throw new NotFoundException('ScreenShoot not found', 404);
    }

    return register;
  }
}

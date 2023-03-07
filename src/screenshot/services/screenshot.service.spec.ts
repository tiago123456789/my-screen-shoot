import { User } from '../../users/user.entity';
import { ILoggerAdapter } from '../../common/adapters/logger/ilogger.adapter';
import { UsersService } from '../../users/users.service';
import { iProducerQueueAdapter } from '../adapters/queue/iproducer-queue.adapter';
import { IScreenShooterAdapter } from '../adapters/screen-shooter/iscreenshooter.adapter';
import { IStorageAdapter } from '../adapters/storage/istorage.adapter';
import { IScreenShotRepository } from '../repositories/iscreenshot.repository';
import { ScreenShot } from '../screenshot.entity';
import { ScreenshotService } from './screenshot.service';
import { Pagination } from '../../common/types/pagination';

describe('ScreenShotService', () => {
  let screenShooter: jest.Mocked<IScreenShooterAdapter>;
  let storage: jest.Mocked<IStorageAdapter>;
  let repository: jest.Mocked<IScreenShotRepository>;
  let producerQueue: jest.Mocked<iProducerQueueAdapter>;
  let logger: jest.Mocked<ILoggerAdapter>;
  let userService: jest.Mocked<UsersService>;
  let screenShotService: ScreenshotService;

  const fakeId = 'e69f04b6-7d1c-4a2a-bb23-2d7eaff3263d';
  const fakeUserId = 'e69f04b6-7d1c-4a2a-bb23-2d7eaff3263dd';
  const fakeParamsTakeScreenShot = {
    id: fakeId,
    params: {
      format: 'png',
      quality: 100,
      isFullPage: false,
      filename: './screenshoots_images/1677968031931github-full.png',
      scheduledAt: '2023-03-04 16:45:00',
      url: 'https://github.com/',
    },
  };

  beforeEach(() => {
    repository = {
      save: null,
      update: jest.fn(),
      findAllScheduled: jest.fn(),
      findById: jest.fn(),
      findAllByUserId: jest.fn(),
      find10Last: jest.fn(),
      getMetricsUsageLast30Days: jest.fn(),
    };

    producerQueue = {
      publishInBatch: jest.fn(),
      publish: jest.fn(),
    };

    logger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    screenShooter = {
      takeScreenShot: jest.fn(),
    };

    storage = {
      store: jest.fn(),
    };

    screenShotService = new ScreenshotService(
      screenShooter,
      storage,
      repository,
      producerQueue,
      logger,
      userService,
    );
  });

  it('Should be throw exception when try get screen shoot by id, but not found', async () => {
    try {
      repository.findById.mockResolvedValue(null);
      await screenShotService.findById(fakeId, fakeUserId);
    } catch (error) {
      expect(error.message).toBe('ScreenShoot not found');
    }
  });

  it('Should be throw exception when try get screen shoot by id, but try getting register not belong the user', async () => {
    try {
      const screenShot = new ScreenShot();
      screenShot.setId(fakeId);

      const user = new User();
      user.setId(fakeId);
      screenShot.setUser(user);

      repository.findById.mockResolvedValue(screenShot);
      await screenShotService.findById(fakeId, fakeUserId);
    } catch (error) {
      expect(error.message).toBe('ScreenShoot not found');
    }
  });

  it('Should be return screen shoots the user paginated', async () => {
    const screenShot = new ScreenShot();
    screenShot.setId(fakeId);

    const user = new User();
    user.setId(fakeId);
    screenShot.setUser(user);

    repository.findAllByUserId.mockResolvedValue([[screenShot, screenShot], 2]);
    const pagination: Pagination = new Pagination(1, 2);
    const output = await screenShotService.findAllByUserId(
      fakeUserId,
      pagination,
    );

    expect(output.total).toBe(2);
    expect(output.data.length).toBe(2);
    expect(output.itemsPerPage).toBe(2);
    expect(output.page).toBe(1);
  });

  it('Should be return screen shoots the user paginated', async () => {
    const screenShot = new ScreenShot();
    screenShot.setId(fakeId);

    const user = new User();
    user.setId(fakeId);
    screenShot.setUser(user);

    repository.findAllByUserId.mockResolvedValue([[screenShot, screenShot], 2]);
    const pagination: Pagination = new Pagination(1, 2);
    const output = await screenShotService.findAllByUserId(
      fakeUserId,
      pagination,
    );

    expect(output.total).toBe(2);
    expect(output.data.length).toBe(2);
    expect(output.itemsPerPage).toBe(2);
    expect(output.page).toBe(1);
  });

  it('Should be return last 10 screen shoots the user', async () => {
    const screenShot = new ScreenShot();
    screenShot.setId(fakeId);

    const user = new User();
    user.setId(fakeId);
    screenShot.setUser(user);

    const screenShoots: ScreenShot[] = Array(10).fill(screenShot);
    repository.find10Last.mockResolvedValue(screenShoots);

    const output = await screenShotService.find10Last(screenShoots);
    expect(output.length).toBe(screenShoots.length);
    expect(output[0].getId()).toBe(screenShoots[0].getId());
    expect(output[1].getId()).toBe(screenShoots[1].getId());
  });

  it('Should be return metrics usage last 30 days the user take screen shoot', async () => {
    const screenShoots: any[] = Array(2).fill({
      updated_at: new Date(),
      total: 10,
    });
    repository.getMetricsUsageLast30Days.mockResolvedValue(screenShoots);
    const output = await screenShotService.getMetricsUsageLast30Days(
      screenShoots,
    );
    expect(output[0].date).toBe(screenShoots[0].updated_at);
    expect(output[0].total).toBe(screenShoots[0].total);
    expect(output[1].date).toBe(screenShoots[1].updated_at);
    expect(output[1].total).toBe(screenShoots[1].total);
  });

  it("Should be try publish scheduled screen shoot to queue, but finish before publish in queue bucause don't have items", async () => {
    const screenShot = new ScreenShot();
    screenShot.setId(fakeId);

    const user = new User();
    user.setId(fakeId);
    screenShot.setUser(user);

    repository.findAllScheduled.mockResolvedValue([]);
    await screenShotService.publishScheduledScreenShoots();
    expect(producerQueue.publishInBatch).toBeCalledTimes(0);
    expect(repository.findAllScheduled).toBeCalledTimes(1);
    expect(logger.info).toBeCalledTimes(2);
  });

  it('Should be publish 10 scheduled screen shoot to queue', async () => {
    const screenShot = new ScreenShot();
    screenShot.setId(fakeId);
    screenShot.setParams(
      JSON.stringify({
        filename: './screenshoots_images/1677968031931github-full.png',
        format: 'png',
        isFullPage: true,
        scheduledAt: '2023-03-04 16:45:00',
        url: 'https://github.com/',
        webhookUrl: 'https://webhook.site/cb49288f-2c21-4310-9921-ee1b98408057',
      }),
    );

    const user = new User();
    user.setId(fakeId);
    screenShot.setUser(user);

    const screenShoots: ScreenShot[] = Array(10).fill(screenShot);
    repository.findAllScheduled.mockResolvedValue(screenShoots);
    await screenShotService.publishScheduledScreenShoots();
    expect(producerQueue.publishInBatch).toBeCalledTimes(1);
  });

  it('Should be throw exception when try take screen shoot in background, but screen shoot not found', async () => {
    try {
      const screenShot = new ScreenShot();
      screenShot.setId(fakeId);
      screenShot.setParams(
        JSON.stringify({
          filename: './screenshoots_images/1677968031931github-full.png',
          format: 'png',
          isFullPage: true,
          scheduledAt: '2023-03-04 16:45:00',
          url: 'https://github.com/',
        }),
      );

      const user = new User();
      user.setId(fakeId);
      screenShot.setUser(user);

      repository.findById.mockResolvedValue(null);
      await screenShotService.takeScheduledScreenShoot(
        // @ts-ignore
        fakeParamsTakeScreenShot,
      );
    } catch (error) {
      expect(error.message).toBe('ScreenShot not exist');
    }
  });

  it("Should be don't try take screen shoot in background, because already has screen shoot", async () => {
    const screenShot = new ScreenShot();
    screenShot.setId(fakeId);
    screenShot.setLink("'https://github.com/");
    screenShot.setParams(
      JSON.stringify({
        filename: './screenshoots_images/1677968031931github-full.png',
        format: 'png',
        isFullPage: true,
        scheduledAt: '2023-03-04 16:45:00',
        url: 'https://github.com/',
        webhookUrl: 'https://webhook.site/cb49288f-2c21-4310-9921-ee1b98408057',
      }),
    );

    const user = new User();
    user.setId(fakeId);
    screenShot.setUser(user);

    repository.findById.mockResolvedValue(screenShot);
    // @ts-ignore
    await screenShotService.takeScheduledScreenShoot(fakeParamsTakeScreenShot);

    expect(repository.update).toHaveBeenCalledTimes(0);
    expect(producerQueue.publish).toHaveBeenCalledTimes(0);
  });

  it("Should be try take screen shoot in background, but don't notify via webhook", async () => {
    const screenShot = new ScreenShot();
    screenShot.setId(fakeId);
    screenShot.setParams(
      JSON.stringify({
        filename: './screenshoots_images/1677968031931github-full.png',
        format: 'png',
        isFullPage: true,
        scheduledAt: '2023-03-04 16:45:00',
        url: 'https://github.com/',
      }),
    );

    const user = new User();
    user.setId(fakeId);
    screenShot.setUser(user);

    repository.findById.mockResolvedValue(screenShot);
    screenShooter.takeScreenShot.mockResolvedValue(Buffer.from('teste'));
    storage.store.mockResolvedValue('http://localhost:3000/teste.png');
    // @ts-ignore
    await screenShotService.takeScheduledScreenShoot(fakeParamsTakeScreenShot);

    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(producerQueue.publish).toHaveBeenCalledTimes(0);
    expect(storage.store).toHaveBeenCalledTimes(1);
    expect(screenShooter.takeScreenShot).toHaveBeenCalledTimes(1);
  });

  it('Should be try take screen shoot in background and send message to notify via webhook', async () => {
    const screenShot = new ScreenShot();
    screenShot.setId(fakeId);
    screenShot.setWebhookUrl('http://example.com.br/1677968031931');
    screenShot.setParams(
      JSON.stringify({
        filename: './screenshoots_images/1677968031931github-full.png',
        format: 'png',
        isFullPage: true,
        scheduledAt: '2023-03-04 16:45:00',
        url: 'https://github.com/',
      }),
    );

    const user = new User();
    user.setId(fakeId);
    screenShot.setUser(user);

    repository.findById.mockResolvedValue(screenShot);
    screenShooter.takeScreenShot.mockResolvedValue(Buffer.from('teste'));
    storage.store.mockResolvedValue('http://localhost:3000/teste.png');
    // @ts-ignore
    await screenShotService.takeScheduledScreenShoot(fakeParamsTakeScreenShot);

    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(producerQueue.publish).toHaveBeenCalledTimes(1);
    expect(storage.store).toHaveBeenCalledTimes(1);
    expect(screenShooter.takeScreenShot).toHaveBeenCalledTimes(1);
  });
});

import { ILoggerAdapter } from 'src/common/adapters/logger/ilogger.adapter';
import { IHttpAdapter } from '../adapters/http/ihttp.adapter';
import { IScreenShotRepository } from '../repositories/iscreenshot.repository';
import { ScreenShot } from '../screenshot.entity';
import { WebhookService } from './webhook.service';

describe('WebhookService', () => {
  let webhookService: WebhookService;
  let httpClient: jest.Mocked<IHttpAdapter>;
  let logger: jest.Mocked<ILoggerAdapter>;
  let repository: jest.Mocked<IScreenShotRepository>;

  beforeEach(() => {
    httpClient = {
      post: jest.fn(),
      get: jest.fn(),
    };

    logger = {
      error: jest.fn(),
      info: jest.fn(),
    };

    repository = {
      find10Last: null,
      findAllByUserId: null,
      findAllScheduled: null,
      findById: jest.fn(),
      getMetricsUsageLast30Days: null,
      save: null,
      update: jest.fn(),
    };

    webhookService = new WebhookService(httpClient, logger, repository);
  });

  it('Should be throw exception when try made request, but return reponse code different 200', async () => {
    try {
      httpClient.post.mockResolvedValue({
        status: 500,
        data: {},
      });
      await webhookService.trigger({
        id: 'a102f744-5fc2-4834-a729-6b4b086ffc9f',
        link: 'http://localhost:3000/image_fake.png',
        url: 'http://localhost:3000/a102f744-5fc2-4834-a729-6b4b086ffc9f',
      });
    } catch (error) {
      expect(logger.info).toBeCalledTimes(2);
      expect(logger.error).toBeCalledTimes(1);
      expect(error.message).toContain('Error returned the request => ');
    }
  });

  it('Should be made request with success', async () => {
    const screenShoot = new ScreenShot();
    screenShoot.setId('a102f744-5fc2-4834-a729-6b4b086ffc9f');

    httpClient.post.mockResolvedValue({
      status: 200,
      data: {},
    });
    repository.findById.mockResolvedValue(screenShoot);

    await webhookService.trigger({
      id: 'a102f744-5fc2-4834-a729-6b4b086ffc9f',
      link: 'http://localhost:3000/image_fake.png',
      url: 'http://localhost:3000/a102f744-5fc2-4834-a729-6b4b086ffc9f',
    });

    expect(repository.update).toBeCalledTimes(1);
    expect(repository.findById).toBeCalledTimes(1);
    expect(logger.info).toBeCalledTimes(5);
    expect(logger.error).toBeCalledTimes(0);
  });
});

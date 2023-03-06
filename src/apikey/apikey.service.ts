import { Inject, Injectable } from '@nestjs/common';
import { LogicBusinessException } from '../common/exceptions/logic-business.exception';
import { NotFoundException } from '../common/exceptions/not-found.exception';
import { SecurityException } from '../common/exceptions/security.exception';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { ICacheAdapter } from './adapters/icache.adapter';
import { ApiKey } from './apikey.entity';
import { ApiKeyOutput } from './dtos/apikey-output.dto';
import { IApikeyRepository } from './repositories/iapikey.repository';

@Injectable()
export class ApikeyService {
  constructor(
    @Inject('IApikeyRepository') private repository: IApikeyRepository,
    @Inject('ICacheAdapter') private cache: ICacheAdapter,
    private userService: UsersService,
  ) {}

  public async getApiKey(userId): Promise<ApiKeyOutput> {
    const apiKey = await this.findByUserId(userId);
    if (!apiKey) {
      throw new NotFoundException("You don't have one api key", 404);
    }

    const apiKeyOutput = new ApiKeyOutput();
    apiKeyOutput.apikey = apiKey.getId();
    return apiKeyOutput;
  }

  public findByUserId(userId) {
    return this.repository.findByUserId(userId);
  }

  async create(userId: string): Promise<ApiKeyOutput> {
    const apiKeyByUserId = await this.findByUserId(userId);

    if (apiKeyByUserId) {
      throw new LogicBusinessException('You can have one api key', 409);
    }

    const user: User = await this.userService.findUserById(userId);
    const apiKey: ApiKey = new ApiKey();
    apiKey.setUser(user);

    await this.repository.create(apiKey);

    const apiKeyOutput = new ApiKeyOutput();
    apiKeyOutput.apikey = apiKey.getId();
    return apiKeyOutput;
  }

  async remove(userId: string) {
    const apiKeyByUserId = await this.findByUserId(userId);

    if (!apiKeyByUserId) {
      throw new NotFoundException("You don't have one api key", 404);
    }

    await this.repository.deleteByUserId(userId);
  }

  async isValidApiKey(apiKey: string): Promise<string> {
    const hasInCache = await this.cache.get(apiKey);

    if (hasInCache) {
      return hasInCache;
    }

    const apikeyRegistered: ApiKey = await this.repository.findById(apiKey);
    if (!apikeyRegistered) {
      throw new SecurityException('Api key is invalid!', 403);
    }

    await this.cache.save(
      apikeyRegistered.getId(),
      apikeyRegistered.getUser().getId(),
      10,
    );

    return apikeyRegistered.getUser().getId();
  }
}

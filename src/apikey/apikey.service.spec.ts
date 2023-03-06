import { IUsersRepository } from 'src/users/repositories/iusers.repository';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { ICacheAdapter } from './adapters/icache.adapter';
import { ApiKey } from './apikey.entity';
import { ApikeyService } from './apikey.service';
import { IApikeyRepository } from './repositories/iapikey.repository';

describe('ApikeyService', () => {
  let service: ApikeyService;
  let repository: jest.Mocked<IApikeyRepository>;
  let cache: jest.Mocked<ICacheAdapter>;
  let userRepository: jest.Mocked<IUsersRepository>;
  let encrypterAdapter;
  let jwtAdapter;
  let userService;

  const fakeUserId = '034afadd-7fe1-4d8a-8fae-e33518fa16ee';
  const apiKey = new ApiKey();
  apiKey.setId(fakeUserId);
  const user = new User();
  user.setId(fakeUserId);
  apiKey.setUser(user);

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      deleteByUserId: jest.fn(),
    };
    cache = {
      save: jest.fn(),
      reset: jest.fn(),
      get: jest.fn(),
    };

    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    encrypterAdapter = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    jwtAdapter = {
      generate: jest.fn(),
      verify: jest.fn(),
    };

    userService = new UsersService(
      userRepository,
      encrypterAdapter,
      jwtAdapter,
    );
    service = new ApikeyService(repository, cache, userService);
  });

  it("Should be throw exception when try remove api key, but don't have", async () => {
    try {
      repository.findByUserId.mockReturnValue(null);
      await service.remove(fakeUserId);
    } catch (error) {
      expect(error.message).toBe("You don't have one api key");
    }
  });

  it('Should be remove api key with success', async () => {
    repository.findByUserId.mockResolvedValue(apiKey);
    await service.remove(fakeUserId);

    expect(repository.deleteByUserId).toHaveBeenCalledTimes(1);
  });

  it("Should be throw exception when try get api key the user, but don't have", async () => {
    try {
      repository.findByUserId.mockResolvedValue(null);
      await service.getApiKey(fakeUserId);
    } catch (error) {
      expect(error.message).toBe("You don't have one api key");
    }
  });

  it('Should be get api key the user with success', async () => {
    repository.findByUserId.mockResolvedValue(apiKey);
    const outputApiKey = await service.getApiKey(fakeUserId);
    expect(outputApiKey.apikey).toBe(apiKey.getId());
  });

  it('Should be throw exception when create api key for user , but already exist', async () => {
    try {
      repository.findByUserId.mockResolvedValue(apiKey);
      await service.create(fakeUserId);
    } catch (error) {
      expect(error.message).toBe('You can have one api key');
    }
  });

  it('Should be throw exception when create api key for user , but already exist', async () => {
    repository.findByUserId.mockResolvedValue(null);
    userRepository.findById.mockResolvedValue(user);

    await service.create(fakeUserId);
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  it('Should be return user id when cache return value', async () => {
    cache.get.mockResolvedValue(fakeUserId);
    const userId = await service.isValidApiKey(fakeUserId);
    expect(userId).toBe(fakeUserId);
    expect(cache.save).toBeCalledTimes(0);
    expect(repository.findById).toBeCalledTimes(0);
  });

  it('Should be throw exception when check if user exist, but api key not exist', async () => {
    try {
      cache.get.mockResolvedValue(undefined);
      repository.findById.mockResolvedValue(null);
      await service.isValidApiKey(fakeUserId);
    } catch (error) {
      expect(error.message).toBe('Api key is invalid!');
    }
  });

  it('Should be check if api key is valid', async () => {
    cache.get.mockResolvedValue(undefined);
    repository.findById.mockResolvedValue(apiKey);
    const userId = await service.isValidApiKey(fakeUserId);

    expect(cache.save).toBeCalledTimes(1);
    expect(repository.findById).toBeCalledTimes(1);
    expect(userId).toBe(fakeUserId);
  });
});

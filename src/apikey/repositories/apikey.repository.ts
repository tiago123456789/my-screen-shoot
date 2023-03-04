import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../apikey.entity';
import { IApikeyRepository } from './iapikey.repository';

@Injectable()
export class ApikeyRepository implements IApikeyRepository {
  constructor(
    @InjectRepository(ApiKey) private repository: Repository<ApiKey>,
  ) {}

  async deleteByUserId(userId: string): Promise<void> {
    const apiKey = await this.findByUserId(userId);
    await this.repository.delete(apiKey);
  }

  findByUserId(userId: string): Promise<ApiKey> {
    return this.repository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async create(apiKey: ApiKey): Promise<ApiKey> {
    await this.repository.insert(apiKey);
    return apiKey;
  }

  async findById(id: string): Promise<ApiKey> {
    const register = await this.repository.find({
      where: {
        id,
      },
    });

    return register[0];
  }
}

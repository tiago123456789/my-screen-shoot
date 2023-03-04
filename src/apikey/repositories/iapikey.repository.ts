import { ApiKey } from '../apikey.entity';

export interface IApikeyRepository {
  create(apiKey: ApiKey): Promise<ApiKey>;
  findById(id: string): Promise<ApiKey>;
  findByUserId(userId: string): Promise<ApiKey>;
  deleteByUserId(userId: string): Promise<void>;
}

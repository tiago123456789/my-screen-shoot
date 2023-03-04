import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ICacheAdapter } from './icache.adapter';

export class CacheManagerAdapter implements ICacheAdapter {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  save(key: string, value: string, ttl = 5): Promise<void> {
    return this.cacheManager.set(key, value, ttl);
  }

  get(key: string): Promise<string | undefined> {
    return this.cacheManager.get(key);
  }

  reset(key: string): Promise<void> {
    return this.cacheManager.del(key);
  }
}

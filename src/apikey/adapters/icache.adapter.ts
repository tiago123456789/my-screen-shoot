export interface ICacheAdapter {
  save(key: string, value: string, ttl: number): Promise<void>;
  reset(key: string): Promise<void>;
  get(key: string): Promise<string | undefined>;
}

export interface IStorageAdapter {
  store(filename, content: Buffer | string): Promise<string>;
}

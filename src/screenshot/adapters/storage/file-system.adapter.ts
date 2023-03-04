import * as fs from 'fs/promises';
import { IStorageAdapter } from './istorage.adapter';

export class FileSystemAdapter implements IStorageAdapter {
  async store(filename: string, content: Buffer | string): Promise<string> {
    await fs.writeFile(filename, content);
    const filenameSplited = filename.split('/');
    filename = filenameSplited[filenameSplited.length - 1];
    return `${process.env.URL_APP}${filename}`;
  }
}

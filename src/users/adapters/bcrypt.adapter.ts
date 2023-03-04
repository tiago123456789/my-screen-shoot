import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { IEncrypterAdapter } from './iencrypter.adapter';

@Injectable()
export class BcryptAdapter implements IEncrypterAdapter {
  hash(value: any): Promise<string> {
    return bcrypt.hash(value, 8);
  }

  compare(textPlain: any, valueHashed: any): Promise<boolean> {
    return bcrypt.compare(textPlain, valueHashed);
  }
}

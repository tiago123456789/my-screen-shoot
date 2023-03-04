import { ApiException } from './api.exception';

export class NotFoundException extends ApiException {
  constructor(message, code) {
    super(message, code);
  }
}

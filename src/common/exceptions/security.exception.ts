import { ApiException } from './api.exception';

export class SecurityException extends ApiException {
  constructor(message, code) {
    super(message, code);
  }
}

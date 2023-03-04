import { ApiException } from './api.exception';

export class LogicBusinessException extends ApiException {
  constructor(message, code) {
    super(message, code);
  }
}

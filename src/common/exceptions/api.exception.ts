export abstract class ApiException extends Error {
  private code: number;

  constructor(message, code) {
    super(message);
    this.code = code;
  }

  getCode() {
    return this.code;
  }
}

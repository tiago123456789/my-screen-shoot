export interface IEncrypterAdapter {
  hash(value): Promise<string>;
  compare(textPlain, valueHashed): Promise<boolean>;
}

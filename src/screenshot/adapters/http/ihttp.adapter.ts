import { HttpReponse } from './http-response';

export interface IHttpAdapter {
  get(url: string): Promise<HttpReponse>;

  post(url: string, data: { [key: string]: any }): Promise<HttpReponse>;
}

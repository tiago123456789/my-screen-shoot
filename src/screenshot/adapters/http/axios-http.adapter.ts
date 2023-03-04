import axios from 'axios';
import { IHttpAdapter } from './ihttp.adapter';

export class AxiosHttpAdapter implements IHttpAdapter {
  get(url: string): Promise<any> {
    return axios.get(url);
  }

  post(url: string, data: { [key: string]: any }): Promise<any> {
    return axios.post(url, data);
  }
}

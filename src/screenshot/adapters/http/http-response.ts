export class HttpReponse {
  status: number;
  data: Array<{ [key: string]: any }> | { [key: string]: any };
}

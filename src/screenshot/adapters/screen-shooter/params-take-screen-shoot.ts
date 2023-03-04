export enum Format {
  PNG = 'png',
  JPEG = 'jpeg',
}

export class ParamsTakeScreenShoot {
  url: string;
  width?: number;
  height?: number;
  element?: string;
  filename: string;
  format: Format;
  quality = 100;
  isFullPage = false;
  scheduledAt: string;
  webhookUrl: string;
}

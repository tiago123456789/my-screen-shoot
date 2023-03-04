import { ParamsTakeScreenShoot } from './params-take-screen-shoot';

export interface IScreenShooterAdapter {
  takeScreenShot(
    url: string,
    params: ParamsTakeScreenShoot,
  ): Promise<string | Buffer>;
}

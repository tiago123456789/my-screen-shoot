import { ParamsTakeScreenShoot } from '../screen-shooter/params-take-screen-shoot';
import { MessageQueue } from './message-queue';

export class ScreenShotMessageQueue extends MessageQueue {
  id: string;
  params: ParamsTakeScreenShoot;
}

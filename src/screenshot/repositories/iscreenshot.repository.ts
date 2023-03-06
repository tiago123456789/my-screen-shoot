import { ScreenShot } from '../screenshot.entity';

export interface IScreenShotRepository {
  save(data: ScreenShot): Promise<ScreenShot>;
  update(data: ScreenShot): Promise<ScreenShot>;
  findAllScheduled(): Promise<ScreenShot[]>;
  findById(id: string): Promise<ScreenShot>;
  findAllByUserId(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<[ScreenShot[], number]>;
  find10Last(userId): Promise<ScreenShot[]>;
  getMetricsUsageLast30Days(userId): Promise<any>;
}

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Raw } from 'typeorm';
import { ScreenShot } from '../screenshot.entity';
import { IScreenShotRepository } from './iscreenshot.repository';

export class ScreenShotRepository implements IScreenShotRepository {
  constructor(
    @InjectRepository(ScreenShot) private repository: Repository<ScreenShot>,
  ) {}

  async update(data: ScreenShot): Promise<ScreenShot> {
    await this.repository.update(data.getId(), data);
    return data;
  }

  async save(data: ScreenShot): Promise<ScreenShot> {
    await this.repository.insert(data);
    return data;
  }

  findAllByUserId(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<[ScreenShot[], number]> {
    return this.repository.findAndCount({
      order: {
        createdAt: 'DESC',
      },
      skip: offset,
      take: limit,
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  findAllScheduled(): Promise<ScreenShot[]> {
    return this.repository.find({
      relations: ['user'],
      where: {
        scheduledAt: Raw((alias) => `${alias} <= (NOW() - INTERVAL '3 hour')`),
        link: IsNull(),
      },
    });
  }

  findById(id: string): Promise<ScreenShot> {
    return this.repository.findOne({
      relations: ['user'],
      where: {
        id: id,
      },
    });
  }

  find10Last(userId): Promise<ScreenShot[]> {
    return this.repository.find({
      where: {
        user: { id: userId },
      },
      order: {
        updatedAt: 'DESC',
      },
      take: 10,
    });
  }

  getMetricsUsageLast30Days(userId): Promise<any> {
    const startDate = new Date();
    startDate.setUTCHours(0);
    startDate.setUTCMinutes(0);
    startDate.setUTCMilliseconds(0);
    startDate.setMonth(startDate.getMonth() - 1);

    const endDate = new Date();
    endDate.setUTCHours(23);
    endDate.setUTCMinutes(59);
    endDate.setUTCMilliseconds(59);

    return this.repository.query(
      `
      select updated_at::DATE, count(*) as total from screen_shoots
      where user_id = $1 AND updated_at between $2 AND $3 
      group by updated_at::DATE
    `,
      [userId, startDate, endDate],
    );
  }
}

import { ScreenShot } from '../screenshot.entity';

export class OutputScreenshootPaginatedDto {
  total: number;
  page: number;
  itemsPerPage: number;
  data: ScreenShot[];
}

import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ApikeyAuthGuard } from '../apikey/apikey-auth.guard';
import { RequestWithUserId } from '../common/types/RequestWithUserId';
import { OutputScreenshootPaginatedDto } from './dtos/output-screenshoot-paginated.dto';
import { OutputScreenDto } from './dtos/output-screenshoot.dto';
import { ParamsTakeScreenShootDto } from './dtos/params-take-screenshoot.dto';
import { ScreenshotService } from './services/screenshot.service';
import { Pagination } from '../common/types/pagination';
import { ScreenShot } from './screenshot.entity';
import { OutputMetricsUsageDto } from './dtos/output-metrics-usage.dto';

@UseGuards(ApikeyAuthGuard)
@Controller('screenshots')
export class ScreenshotController {
  constructor(private screenShootService: ScreenshotService) {}

  @Post()
  takeScreenShoot(
    @Body() params: ParamsTakeScreenShootDto,
    @Req() request: RequestWithUserId,
  ): Promise<OutputScreenDto> {
    return this.screenShootService.create(params.url, request.userId, params);
  }

  @Get('/last-10-requests')
  find10Last(@Req() request: RequestWithUserId): Promise<ScreenShot[]> {
    return this.screenShootService.find10Last(request.userId);
  }

  @Get('/metrics/usage')
  async getMetricsUsageLast30Days(
    @Req() request: RequestWithUserId,
  ): Promise<OutputMetricsUsageDto[]> {
    return this.screenShootService.getMetricsUsageLast30Days(request.userId);
  }

  @Get('/:id')
  findById(
    @Param('id') id: string,
    @Req() request: RequestWithUserId,
  ): Promise<ScreenShot> {
    return this.screenShootService.findById(id, request.userId);
  }

  @Get()
  findAllByUserIdPaginated(
    @Req() req: RequestWithUserId,
    @Query('page') page: number,
    @Query('itemsPerPage') itemsPerPage: number,
  ): Promise<OutputScreenshootPaginatedDto> {
    return this.screenShootService.findAllByUserId(
      req.userId,
      new Pagination(page, itemsPerPage),
    );
  }
}

import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestWithUserId } from 'src/common/types/RequestWithUserId';
import { UserAuthGuard } from 'src/users/user-auth.guard';
import { ApikeyService } from './apikey.service';
import { ApiKeyOutput } from './dtos/apikey-output.dto';

@UseGuards(UserAuthGuard)
@Controller('apikeys')
export class ApikeyController {
  constructor(private apikeyService: ApikeyService) {}

  @Post()
  create(@Req() request: RequestWithUserId): Promise<ApiKeyOutput> {
    return this.apikeyService.create(request.userId);
  }

  @Delete()
  @HttpCode(204)
  remove(@Req() request: RequestWithUserId): Promise<void> {
    return this.apikeyService.remove(request.userId);
  }

  @Get('/my')
  getApiKey(@Req() request: RequestWithUserId): Promise<ApiKeyOutput> {
    return this.apikeyService.getApiKey(request.userId);
  }
}

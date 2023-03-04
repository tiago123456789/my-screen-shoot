import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { HEADERS } from 'src/common/constants/App';
import { RequestWithUserId } from 'src/common/types/RequestWithUserId';
import { ApikeyService } from './apikey.service';

@Injectable()
export class ApikeyAuthGuard implements CanActivate {
  constructor(private readonly apikeyService: ApikeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUserId = context.switchToHttp().getRequest();
    const apikey = request.get(HEADERS.API_KEY);
    const userId = await this.apikeyService.isValidApiKey(apikey);
    request.userId = userId;
    return true;
  }
}

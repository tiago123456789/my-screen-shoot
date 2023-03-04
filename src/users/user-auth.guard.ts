import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { HEADERS } from 'src/common/constants/App';
import { UsersService } from './users.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private readonly userService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const accessToken = request.get(HEADERS.AUTHORIZATION);
    return await this.userService.hasAuthenticated(accessToken);
  }
}

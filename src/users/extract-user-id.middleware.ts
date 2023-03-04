import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { HEADERS } from 'src/common/constants/App';
import { RequestWithUserId } from 'src/common/types/RequestWithUserId';
import { IJwtAdapter } from './adapters/ijwt.adapter';
import { JwtPayloadDto } from './dtos/jwt-payload.dto';

@Injectable()
export class ExtractUserIdMiddleware implements NestMiddleware {
  constructor(
    @Inject('IJwtAdapter')
    private readonly jwtAdapter: IJwtAdapter,
  ) {}

  async use(req: RequestWithUserId, res: Response, next: NextFunction) {
    const accessToken = req.get(HEADERS.AUTHORIZATION);
    const payload: JwtPayloadDto | boolean = await this.jwtAdapter.verify(
      accessToken,
    );

    // @ts-ignore
    req.userId = payload.id;
    next();
  }
}

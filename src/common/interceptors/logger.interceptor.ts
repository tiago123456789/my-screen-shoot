import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ILoggerAdapter } from '../adapters/logger/ilogger.adapter';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(@Inject('ILoggerAdapter') private logger: ILoggerAdapter) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.log(context.switchToHttp().getRequest());
    return next.handle();
  }

  private log(req) {
    this.logger.info({
      timestamp: new Date().toISOString(),
      method: req.method,
      route: req.route.path,
      data: {
        query: req.query,
        params: req.params,
      },
      ip: req.ip,
    });
  }
}

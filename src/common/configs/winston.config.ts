import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig: WinstonModuleOptions = {
  levels: winston.config.npm.levels,
  defaultMeta: { app: 'api-my-screen-shoot' },
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike(),
      ),
    }),
    new winston.transports.File({
      level: 'info',
      filename: 'application.log',
      dirname: 'logs',
    }),
    new winston.transports.File({
      level: 'error',
      filename: 'application-errors.log',
      dirname: 'logs',
    }),
  ],
};

import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { WinstonLoggerAdapter } from './adapters/logger/winston.adapter';
import { winstonConfig } from './configs/winston.config';

@Module({
  imports: [WinstonModule.forRoot(winstonConfig)],
  controllers: [],
  providers: [
    {
      provide: 'ILoggerAdapter',
      useClass: WinstonLoggerAdapter,
    },
  ],
  exports: [
    {
      provide: 'ILoggerAdapter',
      useClass: WinstonLoggerAdapter,
    },
  ],
})
export class CommonModule {}

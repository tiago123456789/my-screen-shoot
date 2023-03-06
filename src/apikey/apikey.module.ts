import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { CacheManagerAdapter } from './adapters/cache-manager.adapter';
import { ApikeyController } from './apikey.controller';
import { ApiKey } from './apikey.entity';
import { ApikeyService } from './apikey.service';
import { ApikeyRepository } from './repositories/apikey.repository';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([ApiKey]),
    CacheModule.register(),
  ],
  controllers: [ApikeyController],
  providers: [
    ApikeyService,
    {
      provide: 'IApikeyRepository',
      useClass: ApikeyRepository,
    },
    {
      provide: 'ICacheAdapter',
      useClass: CacheManagerAdapter,
    },
  ],
  exports: [ApikeyService],
})
export class ApikeyModule {}

import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BcryptAdapter } from './adapters/bcrypt.adapter';
import { JwtAdapter } from './adapters/jwt.adapter';
import { ExtractUserIdMiddleware } from './extract-user-id.middleware';
import { UsersRepository } from './repositories/users.repository';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get('JWT_SECRET'),
        };
      },
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'IUsersRepository',
      useClass: UsersRepository,
    },
    {
      provide: 'IEncrypterAdapter',
      useClass: BcryptAdapter,
    },
    {
      provide: 'IJwtAdapter',
      useClass: JwtAdapter,
    },
    UsersService,
  ],
  exports: [UsersService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ExtractUserIdMiddleware).forRoutes('apikeys');
  }
}

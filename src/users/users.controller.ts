import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CredentialAuthDto } from './dtos/credential-auth.dto';
import { UsersDto } from './dtos/users.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post()
  @HttpCode(201)
  register(@Body() userDto: UsersDto): Promise<User> {
    return this.userService.create(userDto);
  }

  @Post('/auth')
  @HttpCode(201)
  async authenticate(
    @Body() credentialAuthDto: CredentialAuthDto,
  ): Promise<any> {
    const accessToken = await this.userService.authenticate(credentialAuthDto);
    return {
      accessToken,
    };
  }
}

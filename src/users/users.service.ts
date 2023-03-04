import { Inject, Injectable } from '@nestjs/common';
import { CredentialAuthDto } from './dtos/credential-auth.dto';
import { UsersDto } from './dtos/users.dto';
import { IUsersRepository } from './repositories/iusers.repository';
import { User } from './user.entity';
import { SecurityException } from 'src/common/exceptions/security.exception';
import { IEncrypterAdapter } from './adapters/iencrypter.adapter';
import { IJwtAdapter } from './adapters/ijwt.adapter';
import { HEADERS } from 'src/common/constants/App';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUsersRepository')
    private readonly repository: IUsersRepository,
    @Inject('IEncrypterAdapter')
    private readonly encrypterAdapter: IEncrypterAdapter,
    @Inject('IJwtAdapter')
    private readonly jwtAdapter: IJwtAdapter,
  ) {}

  async create(data: UsersDto): Promise<User> {
    data.password = await this.encrypterAdapter.hash(data.password);
    const user = await this.repository.create(data);
    user.setPassword('');
    return user;
  }

  findUserById(id: string): Promise<User> {
    return this.repository.findById(id);
  }

  async authenticate(credential: CredentialAuthDto): Promise<string> {
    const user = await this.repository.findByEmail(credential.email);
    if (!user) {
      throw new SecurityException('Credentials invalid!', 400);
    }

    const isValid = await this.encrypterAdapter.compare(
      credential.password,
      user.getPassword(),
    );

    if (!isValid) {
      throw new SecurityException('Credentials invalid!', 400);
    }

    const accessToken = await this.jwtAdapter.generate({
      id: user.getId(),
    });

    return accessToken;
  }

  async hasAuthenticated(accessToken: string): Promise<boolean> {
    if (!accessToken || accessToken.length === 0) {
      throw new SecurityException('You need informed accessToken', 401);
    }

    accessToken = accessToken.replace(HEADERS.PREFIX_JWT_TOKEN, '');
    const isValid = await this.jwtAdapter.verify(accessToken);

    if (!isValid) {
      throw new SecurityException('You accessToken is invalid', 403);
    }

    return true;
  }
}

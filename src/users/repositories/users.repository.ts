import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersDto } from '../dtos/users.dto';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { IUsersRepository } from './iusers.repository';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(@InjectRepository(User) private repository: Repository<User>) {}

  async create(data: UsersDto): Promise<User> {
    const user = new User();
    user.setName(data.name);
    user.setEmail(data.email);
    user.setPassword(data.password);
    await this.repository.insert(user);
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const register = await this.repository.find({
      where: {
        email: email,
      },
    });

    return register[0];
  }

  findById(id: string): Promise<User> {
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }
}

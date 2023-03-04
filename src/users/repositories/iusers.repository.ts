import { UsersDto } from '../dtos/users.dto';
import { User } from '../user.entity';

export interface IUsersRepository {
  create(data: UsersDto): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findById(id: string): Promise<User>;
}

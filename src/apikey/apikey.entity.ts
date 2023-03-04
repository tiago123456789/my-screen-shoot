import { User } from 'src/users/user.entity';
import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'api_keys' })
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  private id: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  private user: User;

  getId(): string {
    return this.id;
  }

  getUser(): User {
    return this.user;
  }

  setId(id: string) {
    this.id = id;
  }

  setUser(user: User) {
    this.user = user;
  }
}

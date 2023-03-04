import { IsEmail, IsNotEmpty } from 'class-validator';

export class UsersDto {
  @IsNotEmpty()
  public name: string;

  @IsEmail()
  public email: string;

  @IsNotEmpty()
  public password: string;
}

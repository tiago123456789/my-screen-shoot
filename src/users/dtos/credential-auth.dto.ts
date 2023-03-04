import { IsEmail, IsNotEmpty } from 'class-validator';

export class CredentialAuthDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

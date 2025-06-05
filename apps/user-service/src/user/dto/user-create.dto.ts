import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class UserCreateDTO {
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @IsEmail()
  email: string;
}

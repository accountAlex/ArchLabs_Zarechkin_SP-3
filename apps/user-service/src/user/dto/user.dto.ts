export class UserDTO {
  id: string;
  name: string;
  email: string;

  constructor(partial: Partial<UserDTO>) {
    Object.assign(this, partial);
  }
}

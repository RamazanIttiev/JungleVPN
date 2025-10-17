import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@users/users.entity';
import { UserStatus } from '@users/users.model';
import { Repository } from 'typeorm';

interface IUserService {
  getUser: (id: number) => Promise<User | null>;
  getUserStatus: (id: number) => Promise<UserStatus>;
  createUser: (user: User) => Promise<User>;
  updateUser: (id: number, user: Partial<User>) => Promise<void>;
}

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getUser(id: number) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) return null;

    return {
      ...user,
      expiryTime: Number(user.expiryTime),
    };
  }

  async getUserStatus(id: number) {
    const user = await this.getUser(id);

    if (!user) return 'new';

    return user.status;
  }

  async createUser(user: User) {
    const data = this.usersRepository.create(user);
    return await this.usersRepository.save(data);
  }

  async updateUser(id: number, user: Partial<User>) {
    await this.usersRepository.update(id, user);
  }
}

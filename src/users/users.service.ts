import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@users/users.entity';
import { Repository } from 'typeorm';

interface IUserService {
  getUser: (id: number) => Promise<User | null>;
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
    return this.usersRepository.findOneBy({ id });
  }

  async createUser(user: User) {
    const data = this.usersRepository.create(user);
    return await this.usersRepository.save(data);
  }

  async updateUser(id: number, user: Partial<User>) {
    await this.usersRepository.update(id, user);
  }
}

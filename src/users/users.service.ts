import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@users/users.entity';
import { UserStatus } from '@users/users.model';
import { Repository } from 'typeorm';

interface IUserService {
  getUser: (id: number) => Promise<User | null>;
  getUserStatus: (id: number) => Promise<UserStatus>;
  getIsUserActive: (id: number) => Promise<boolean>;
  getIsUserExpired: (id: number) => Promise<boolean>;
  createUser: (user: User) => Promise<User>;
  updateUser: (id: number, user: Partial<User>) => Promise<User>;
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
    } as User;
  }

  async getUserStatus(id: number) {
    const user = await this.getUser(id);

    if (!user) return 'expired';

    const expired = user.expiryTime < Date.now();
    return expired ? 'expired' : 'active';
  }

  async getIsUserActive(id: number) {
    const status = await this.getUserStatus(id);

    return status === 'active';
  }

  async getIsUserExpired(id: number) {
    const status = await this.getUserStatus(id);

    return status === 'expired';
  }

  async createUser(user: User) {
    const data = this.usersRepository.create(user);
    return await this.usersRepository.save(data);
  }

  async updateUser(id: number, partial: Partial<User>) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new Error(`User ${id} not found`);

    Object.assign(user, partial);
    return await this.usersRepository.save(user);
  }
}

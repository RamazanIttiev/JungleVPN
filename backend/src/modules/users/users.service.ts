import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async get(telegramId: string): Promise<User> {
    const user = await this.repo.findOne({ where: { telegramId } });

    if (!user) {
      throw new NotFoundException(`User ${telegramId} does not exist. method: getUserByTgId`);
    }

    return user;
  }

  async createUser(telegramId: string): Promise<User> {
    const existingUser = await this.get(telegramId);

    if (existingUser) {
      console.log(`User ${existingUser.telegramId} already exists. [method]: createUser`);
      return existingUser;
    }

    const user = this.repo.create({ telegramId });

    try {
      await this.repo.save(user);
    } catch (error) {
      throw new Error('Error creating user. [method]: createUser');
    }

    return user;
  }
}

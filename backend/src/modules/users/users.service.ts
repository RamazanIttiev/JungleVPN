import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findOrCreateByTelegramId(telegramId: string): Promise<User> {
    let user = await this.repo.findOne({ where: { telegramId } });
    if (!user) {
      user = this.repo.create({ telegramId, active: false, expiresAt: null });
      user = await this.repo.save(user);
    }
    return user;
  }

  async setActive(userId: string, active: boolean): Promise<void> {
    await this.repo.update({ id: userId }, { active });
  }
}

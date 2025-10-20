import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentPeriod } from '@payments/payments.model';
import { User } from '@users/users.entity';
import { UserStatus } from '@users/users.model';
import { XuiService } from '@xui/xui.service';
import { Repository } from 'typeorm';

interface IUserService {
  getUser: (id: number) => Promise<User | null>;
  getAllUserIds: () => Promise<number[]>;
  getUserStatus: (id: number) => Promise<UserStatus>;
  getIsUserOnTrial: (id: number) => Promise<boolean>;
  getIsUserActive: (id: number) => Promise<boolean>;
  getIsUserExpired: (id: number) => Promise<boolean>;
  createUser: (user: User) => Promise<User>;
  updateUser: (id: number, user: Partial<User>) => Promise<User>;
  updateExpiryTime: (id: number, period: PaymentPeriod) => Promise<void>;
}

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private xuiService: XuiService,
  ) {}

  async getUser(id: number) {
    const user = await this.usersRepository.findOneBy({ id: id.toString() });

    if (!user) return null;

    return user;
  }

  async getAllUserIds() {
    const users = await this.usersRepository.find({
      select: ['id'],
    });

    return users.map((u) => Number(u.id));
  }

  async getUserStatus(id: number) {
    const user = await this.getUser(id);

    if (!user) return 'trial';

    const userExpiryTime = Number(user.expiryTime);

    const expired = userExpiryTime < Date.now();
    return expired ? 'expired' : 'active';
  }

  async getIsUserOnTrial(id: number) {
    const status = await this.getUserStatus(id);

    return status === 'trial';
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
    const user = await this.getUser(id);
    if (!user) throw new Error(`User ${id} not found`);

    Object.assign(user, partial);
    return await this.usersRepository.save(user);
  }

  async updateExpiryTime(id: number, period: PaymentPeriod) {
    const user = await this.getUser(id);
    if (!user) throw new Error(`User ${id} not found`);

    const userExpiryTime = Number(user.expiryTime);

    const now = Date.now();
    const base = userExpiryTime > now ? userExpiryTime : now;
    const expiryTime = new Date(base);

    switch (period) {
      case '1mo':
        expiryTime.setDate(expiryTime.getDate() + 31);
        break;
      case '3mo':
        expiryTime.setDate(expiryTime.getDate() + 90);
        break;
      case '6mo':
        expiryTime.setDate(expiryTime.getDate() + 180);
        break;
    }

    await this.xuiService.updateClientsExpiryTime(id, expiryTime.getTime());
    await this.updateUser(id, { expiryTime: expiryTime.getTime().toString() });
  }
}

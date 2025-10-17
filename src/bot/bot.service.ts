import { BotContext } from '@bot/bot.model';
import { Injectable } from '@nestjs/common';
import { PaymentPeriod } from '@payments/payments.model';
import { UsersService } from '@users/users.service';
import { ClientDevice } from '@xui/xui.model';
import { XuiService } from '@xui/xui.service';
import { randomId } from '@xui/xui.util';
import { User } from 'grammy/types';

interface IBotService {
  handleNewUser: (ctx: BotContext, tgUser: User, device: ClientDevice) => Promise<void>;
}

@Injectable()
export class BotService implements IBotService {
  constructor(
    private readonly xuiService: XuiService,
    private readonly usersService: UsersService,
  ) {}

  async handleNewUser(ctx: BotContext, tgUser: User, device: ClientDevice) {
    const client = await this.xuiService.addClient(tgUser, device);
    await this.usersService.createUser({
      id: tgUser.id,
      expiryTime: client.expiryTime,
      first_name: tgUser.first_name,
      username: tgUser.username,
      status: 'active',
      clients: [
        {
          id: client.id,
          device: client.comment,
          subId: client.subId,
        },
      ],
    });

    ctx.session.selectedDevice = device;
  }

  validateUser(user: User | undefined) {
    if (!user) {
      throw new Error('User is not found');
    }

    return user;
  }

  async handleExpiredUser(tgUser: User, period: PaymentPeriod, device: ClientDevice) {
    const expiryTime = new Date();
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

    // return this.xuiService.generateUrls(client.subId);
  }

  async handleActiveUser(ctx: BotContext, tgUser: User, device: ClientDevice) {
    // const { clients } = await this.getUser(ctx, tgUser.id);

    const client = await this.xuiService.getClientByDevice(tgUser.id, device);

    if (client) {
      await this.xuiService.updateClient(client, { subId: randomId() });
    }
  }
}

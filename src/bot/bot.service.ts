import { Injectable } from '@nestjs/common';
import { PaymentPeriod } from '@payments/payments.model';
import { User } from '@users/users.entity';
import { UserClient, UserDevice } from '@users/users.model';
import { UsersService } from '@users/users.service';
import { XuiService } from '@xui/xui.service';
import { User as GrammyUser } from 'grammy/types';

interface IBotService {
  handleDeviceSelection: (
    tgUser: GrammyUser,
    device: UserDevice,
  ) => Promise<{ user: User; client: UserClient }>;
}

@Injectable()
export class BotService implements IBotService {
  constructor(
    private readonly xuiService: XuiService,
    private readonly usersService: UsersService,
  ) {}

  // @ts-expect-error
  async handleDeviceSelection(tgUser: GrammyUser, device: UserDevice) {
    // 1️⃣ Fetch user
    const user = await this.usersService.getUser(tgUser.id);

    // 2️⃣ If user doesn't exist → create trial user with 3-month expiry
    if (!user) {
      const client = await this.xuiService.addClient(tgUser, device);

      const newUser = await this.usersService.createUser({
        id: tgUser.id,
        first_name: tgUser.first_name,
        username: tgUser.username,
        status: 'active',
        expiryTime: client.expiryTime,
        clients: [
          {
            id: client.id,
            device,
            subId: client.subId,
          },
        ],
      });

      return { user: newUser, client };
    }

    // 3️⃣ If user exists, check if they already have client for this device
    const existingClient = user.clients.find((c) => c.device === device);
    if (existingClient) {
      return { user, client: existingClient };
    }

    // 4️⃣ Otherwise, add new client (trial or active)
    const client = await this.xuiService.addClient(tgUser, device);
    const updatedUser = await this.usersService.updateUser(tgUser.id, {
      clients: [
        ...user.clients,
        {
          id: client.id,
          device,
          subId: client.subId,
        },
      ],
    });

    return { updatedUser, client };
  }

  validateUser(user: GrammyUser | undefined) {
    if (!user) {
      throw new Error('User is not found');
    }

    return user;
  }

  async handleExpiredUser(tgUser: GrammyUser, period: PaymentPeriod, device: UserDevice) {
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
}

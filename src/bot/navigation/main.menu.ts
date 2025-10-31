import { BotService } from '@bot/bot.service';
import { Menu } from '@bot/navigation/core/menu';
import { BaseMenu } from '@bot/navigation/core/menu/base.menu';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class MainMenu extends BaseMenu {
  readonly menu = new Menu('main-menu');

  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);

    this.menu.text('Подключиться 📶', async (ctx) => {
      const { user } = await this.loadUser(ctx);

      const isExpired = user ? Date.now().toString() > user?.expireAt : false;
      if (isExpired) {
        await this.navigateTo(ctx, 'paymentPeriods');
      }
      await this.navigateTo(ctx, 'devices');
    });
  }

  create() {
    return this.menu;
  }
}

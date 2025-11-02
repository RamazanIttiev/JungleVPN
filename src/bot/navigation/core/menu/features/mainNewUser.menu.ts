import { BotService } from '@bot/bot.service';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Menu } from '@bot/navigation/core/menu';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class MainNewUserMenu extends Base {
  readonly menu = new Menu('main-new-user-menu');

  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);

    this.menu.text('Подключиться 📶', async (ctx) => {
      await this.navigateTo(ctx, 'devices');
    });
  }

  create() {
    return this.menu;
  }
}

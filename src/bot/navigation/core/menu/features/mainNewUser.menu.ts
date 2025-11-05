import { BotService } from '@bot/bot.service';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { DevicesConversation } from '@bot/navigation/core/conversations/features/devices.conversation';
import { Menu } from '@bot/navigation/core/menu';
import { DevicesMenu } from '@bot/navigation/core/menu/features/devices.menu';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class MainNewUserMenu extends Base {
  readonly menu = new Menu('main-new-user-menu');

  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
    readonly devicesConversation: DevicesConversation,
    @Inject(forwardRef(() => DevicesMenu))
    readonly devicesMenu: DevicesMenu,
  ) {
    super(botService, remnaService);

    this.menu.text('Подключиться 📶', async (ctx) => {
      await this.devicesConversation.init(ctx, this.devicesMenu.create());
    });
  }

  create() {
    return this.menu;
  }
}
